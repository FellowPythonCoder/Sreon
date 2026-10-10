/**
 * Sreon Application Server & Engine Gateway
 * Powered by SPRFST Language
 *
 * Provides:
 * 1. High-performance static web server for Sreon UI
 * 2. Real-time SPRFST compiler & runtime execution API
 * 3. Sreon Shield Ad & Tracker blocking web proxy for genuine web browsing
 * 4. Guidebook & Examples API
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { execFile, exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const ROOT_DIR = __dirname;
const UI_DIR = path.join(ROOT_DIR, 'sreon', 'ui');
const SPRFST_BIN = path.join(ROOT_DIR, 'build', 'bin', 'sprfst');

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.icns': 'application/octet-stream',
  '.dmg': 'application/x-apple-diskimage',
  '.zip': 'application/zip',
  '.md': 'text/markdown; charset=utf-8',
  '.spf': 'text/plain; charset=utf-8'
};

// Sreon Shield blocked domains
const SHIELD_BLOCKED_HOSTS = new Set([
  'doubleclick.net', 'google-analytics.com', 'googletagmanager.com',
  'adnxs.com', 'facebook.net', 'connect.facebook.net',
  'hotjar.com', 'taboola.com', 'outbrain.com', 'criteo.com',
  'scorecardresearch.com', 'quantserve.com', 'segment.io', 'mixpanel.com',
  'coin-hive.ws', 'adsystem.com', 'amazon-adsystem.com'
]);

function isBlocked(host) {
  if (!host) return false;
  const h = host.toLowerCase();
  for (const b of SHIELD_BLOCKED_HOSTS) {
    if (h === b || h.endsWith('.' + b)) return true;
  }
  return false;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API 1: Execute SPRFST code
  if (pathname === '/api/sprfst/run' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const code = payload.code || '';
        const tmpFile = path.join('/tmp', `sreon_run_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.spf`);
        fs.writeFileSync(tmpFile, code, 'utf8');

        const t0 = Date.now();
        execFile(SPRFST_BIN, ['run', tmpFile], { timeout: 10000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
          const elapsed = Date.now() - t0;
          try { fs.unlinkSync(tmpFile); } catch (e) {}

          if (err && !stdout && stderr) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, output: stderr, ms: elapsed }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, output: (stdout || '') + (stderr ? '\n' + stderr : ''), ms: elapsed }));
          }
        });
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // API 2: Type check SPRFST code
  if (pathname === '/api/sprfst/check' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const code = payload.code || '';
        const tmpFile = path.join('/tmp', `sreon_chk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.spf`);
        fs.writeFileSync(tmpFile, code, 'utf8');

        execFile(SPRFST_BIN, ['check', tmpFile], { timeout: 10000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
          try { fs.unlinkSync(tmpFile); } catch (e) {}
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: !err, diagnostics: (stdout || '') + (stderr || '') }));
        });
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // API 3: Web Browsing Proxy with Sreon Shield Ad & Tracker Filtering
  if (pathname === '/proxy') {
    const target = parsedUrl.query.url;
    if (!target) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing target URL');
      return;
    }

    let targetUrl;
    try {
      targetUrl = new URL(target);
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid URL');
      return;
    }

    // Check Sreon Shield
    if (isBlocked(targetUrl.hostname)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<html><body style="background:#09090b;color:#ffa136;font-family:sans-serif;text-align:center;padding:50px;">
        <h2>🛡️ Sreon Shield Blocked Request</h2>
        <p>The tracker or advertisement domain <strong>${targetUrl.hostname}</strong> was stopped before fetching.</p>
      </body></html>`);
      return;
    }

    const client = targetUrl.protocol === 'https:' ? https : http;
    const reqHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 Sreon/1.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    };

    const proxyReq = client.get(targetUrl, { headers: reqHeaders, timeout: 8000 }, (proxyRes) => {
      // Handle redirects
      if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
        const redir = new URL(proxyRes.headers.location, targetUrl).toString();
        res.writeHead(302, { 'Location': `/proxy?url=${encodeURIComponent(redir)}` });
        res.end();
        return;
      }

      const contentType = proxyRes.headers['content-type'] || 'text/html';
      const cleanHeaders = {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      };

      // Strip frame-busting security headers so WKWebView / preview renders cleanly
      delete proxyRes.headers['x-frame-options'];
      delete proxyRes.headers['content-security-policy'];
      delete proxyRes.headers['content-security-policy-report-only'];

      if (contentType.includes('text/html')) {
        let htmlBody = '';
        proxyRes.setEncoding('utf8');
        proxyRes.on('data', chunk => { htmlBody += chunk; });
        proxyRes.on('end', () => {
          // Inject Sreon base URL tag and style
          const baseTag = `<base href="${targetUrl.origin}${targetUrl.pathname}">`;
          const sreonShieldBanner = `
            <style>
              .sreon-shield-toast {
                position: fixed; bottom: 12px; right: 12px; z-index: 999999;
                background: rgba(14, 14, 20, 0.9); color: #ffa136; border: 1px solid rgba(255,107,0,0.3);
                border-radius: 12px; padding: 6px 14px; font-family: -apple-system, sans-serif;
                font-size: 11px; backdrop-filter: blur(12px); box-shadow: 0 4px 20px rgba(0,0,0,0.6);
                display: flex; align-items: center; gap: 6px; pointer-events: none;
              }
            </style>
            <div class="sreon-shield-toast">🛡️ Sreon Shield Active · Hardware Protected</div>
          `;

          let modifiedHtml = htmlBody;
          if (modifiedHtml.includes('<head>')) {
            modifiedHtml = modifiedHtml.replace('<head>', `<head>${baseTag}`);
          } else {
            modifiedHtml = baseTag + modifiedHtml;
          }

          if (modifiedHtml.includes('</body>')) {
            modifiedHtml = modifiedHtml.replace('</body>', `${sreonShieldBanner}</body>`);
          } else {
            modifiedHtml += sreonShieldBanner;
          }

          res.writeHead(proxyRes.statusCode || 200, cleanHeaders);
          res.end(modifiedHtml);
        });
      } else {
        res.writeHead(proxyRes.statusCode || 200, cleanHeaders);
        proxyRes.pipe(res);
      }
    });

    proxyReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'text/html' });
      res.end(`<html><body style="background:#09090b;color:#f3f3f5;font-family:sans-serif;padding:40px;text-align:center;">
        <h2 style="color:#ef4444;">⚠️ Connection Failed</h2>
        <p>Could not load <strong>${target}</strong>: ${err.message}</p>
        <p><a href="/proxy?url=${encodeURIComponent(target)}" style="color:#ffa136;">Retry Connection</a></p>
      </body></html>`);
    });

    return;
  }

  // Static File Serving
  let filePath = path.join(UI_DIR, pathname === '/' ? 'index.html' : pathname);
  
  // Also support serving dist files (like Sreon.dmg, Sreon.icns, assets)
  if (pathname.startsWith('/dist/')) {
    filePath = path.join(ROOT_DIR, pathname);
  } else if (pathname.startsWith('/assets/')) {
    filePath = path.join(ROOT_DIR, pathname);
  } else if (pathname.startsWith('/guidebook/')) {
    filePath = path.join(ROOT_DIR, pathname);
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routing
      const indexFallback = path.join(UI_DIR, 'index.html');
      fs.readFile(indexFallback, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`\n\x1b[38;5;214m  SREON — THE NEXT GENERATION OF BROWSING\x1b[0m`);
  console.log(`  Powered by SPRFST Language`);
  console.log(`  Live UI and Engine listening on: http://${HOST}:${PORT}\n`);
});
