#!/usr/bin/env python3
"""
Generates the complete set of Sreon brand and macOS icon assets.
Produces PNGs at 16, 32, 64, 128, 256, 512, 1024 sizes, and packs Sreon.icns.
"""
import os
import math
import struct
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIR = "assets/logo/sreon"
DIST_DIR = "dist"
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(DIST_DIR, exist_ok=True)

def create_sreon_icon(size):
    # Render at 2x for super-sampling / crisp anti-aliasing
    scale = 2
    dim = size * scale
    img = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Coordinates in 512 scale
    s = dim / 512.0
    pad = 24.0 * s
    rect = [pad, pad, dim - pad, dim - pad]
    radius = 108.0 * s

    # 1. Dark Glass Squircle Plate
    bg = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)
    bg_draw.rounded_rectangle(rect, radius=radius, fill=(11, 11, 14, 255))
    
    # Outer glass rim
    bg_draw.rounded_rectangle(rect, radius=radius, outline=(255, 107, 0, 90), width=max(1, int(3 * s)))
    img.alpha_composite(bg)

    # 2. Ambient Orange Glow
    glow = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    cx, cy = dim / 2, dim / 2
    r_glow = 130.0 * s
    glow_draw.ellipse([cx - r_glow, cy - r_glow, cx + r_glow, cy + r_glow], fill=(255, 107, 0, 48))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=int(28 * s)))
    img.alpha_composite(glow)

    # 3. Orbital Ring
    r_orb = 168.0 * s
    draw.ellipse([cx - r_orb, cy - r_orb, cx + r_orb, cy + r_orb], outline=(255, 107, 0, 60), width=max(1, int(3 * s)))
    
    # Speed dots on orbital ring
    for angle in [35, 125, 215, 305]:
        rad = math.radians(angle)
        px = cx + r_orb * math.cos(rad)
        py = cy + r_orb * math.sin(rad)
        dot_r = max(2, int(4 * s))
        draw.ellipse([px - dot_r, py - dot_r, px + dot_r, py + dot_r], fill=(255, 170, 50, 200))

    # 4. Geometric SREON S Nexus Ribbon
    # Bézier sampling for ultra-smooth spline
    def bezier_point(t, p0, p1, p2, p3):
        u = 1 - t
        return (
            u**3 * p0[0] + 3*u**2*t * p1[0] + 3*u*t**2 * p2[0] + t**3 * p3[0],
            u**3 * p0[1] + 3*u**2*t * p1[1] + 3*u*t**2 * p2[1] + t**3 * p3[1]
        )

    # Key control points for the S curve in 512 space
    pts_s = [
        (370*s, 126*s), (240*s, 86*s), (146*s, 160*s), (214*s, 276*s),
        (280*s, 300*s), (356*s, 340*s), (270*s, 404*s), (150*s, 356*s)
    ]

    curve_pts = []
    # Segment 1: top hook into center
    for i in range(50):
        t = i / 49.0
        curve_pts.append(bezier_point(t, pts_s[0], pts_s[1], pts_s[2], pts_s[3]))
    # Segment 2: center through bottom hook
    for i in range(50):
        t = i / 49.0
        curve_pts.append(bezier_point(t, pts_s[3], pts_s[4], pts_s[5], pts_s[7]))

    # Draw glow layer for emblem
    emblem_glow = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
    eg_draw = ImageDraw.Draw(emblem_glow)
    w_glow = max(4, int(44 * s))
    for i in range(len(curve_pts) - 1):
        eg_draw.line([curve_pts[i], curve_pts[i+1]], fill=(255, 107, 0, 180), width=w_glow)
    emblem_glow = emblem_glow.filter(ImageFilter.GaussianBlur(radius=max(1, int(8 * s))))
    img.alpha_composite(emblem_glow)

    # Main Vivid Orange Ribbon with gradient
    w_main = max(2, int(36 * s))
    for i in range(len(curve_pts) - 1):
        t = i / float(len(curve_pts))
        r = int(255)
        g = int(107 + (168 - 107) * (1 - abs(t - 0.5) * 2))
        b = int(10 + (60 - 10) * t)
        draw.line([curve_pts[i], curve_pts[i+1]], fill=(r, g, b, 255), width=w_main)

    # Center Bright Core Filament
    w_core = max(1, int(14 * s))
    for i in range(len(curve_pts) - 1):
        t = i / float(len(curve_pts))
        r = 255
        g = int(180 + 60 * math.sin(t * math.pi))
        b = int(100 + 80 * math.sin(t * math.pi))
        draw.line([curve_pts[i], curve_pts[i+1]], fill=(r, g, b, 255), width=w_core)

    # Center Nexus Core Star
    ncx, ncy = 256 * s, 280 * s
    nr = max(3, int(12 * s))
    draw.ellipse([ncx - nr, ncy - nr, ncx + nr, ncy + nr], fill=(255, 255, 255, 255))
    draw.ellipse([ncx - nr/2, ncy - nr/2, ncx + nr/2, ncy + nr/2], fill=(255, 210, 120, 255))

    # Downsample with Lanczos for super-crisp icon
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

def build_icns(png_paths, out_path):
    """Packs PNGs into macOS .icns binary format."""
    types = {
        16: b"icp4",
        32: b"icp5",
        64: b"ic12",
        128: b"ic07",
        256: b"ic08",
        512: b"ic09",
        1024: b"ic10"
    }
    records = []
    for size, code in sorted(types.items()):
        path = png_paths.get(size)
        if path and os.path.exists(path):
            with open(path, "rb") as f:
                data = f.read()
            rec = code + struct.pack(">I", len(data) + 8) + data
            records.append(rec)
    
    body = b"".join(records)
    total_len = len(body) + 8
    header = b"icns" + struct.pack(">I", total_len)
    with open(out_path, "wb") as f:
        f.write(header + body)
    print(f"  [✓] Built macOS ICNS: {out_path} ({len(header + body) // 1024} KB)")

def main():
    sizes = [16, 32, 64, 128, 256, 512, 1024]
    png_map = {}
    print("Generating Sreon brand icon assets...")
    for sz in sizes:
        icon = create_sreon_icon(sz)
        p = os.path.join(OUTPUT_DIR, f"sreon-{sz}.png")
        icon.save(p, format="PNG", optimize=True)
        png_map[sz] = p
        print(f"  [✓] {p} ({sz}x{sz})")

    # Also make sreon-mark-512.png, sreon-logo.png
    icon512 = png_map[512]
    Image.open(icon512).save(os.path.join(OUTPUT_DIR, "sreon-mark.png"), format="PNG")
    Image.open(icon512).save(os.path.join("assets/logo", "sreon-mark.png"), format="PNG")
    Image.open(png_map[256]).save(os.path.join(OUTPUT_DIR, "sreon-256.png"), format="PNG")

    # Create .icns
    icns_path = os.path.join(OUTPUT_DIR, "Sreon.icns")
    build_icns(png_map, icns_path)
    build_icns(png_map, os.path.join(DIST_DIR, "Sreon.icns"))

if __name__ == "__main__":
    main()
