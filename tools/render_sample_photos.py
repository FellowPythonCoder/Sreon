#!/usr/bin/env python3
"""
Renders high-fidelity sample screenshots/photos of Sreon for documentation,
previews, and presentation.
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT_DIR = "docs/screenshots"
os.makedirs(OUT_DIR, exist_ok=True)

# Helper to draw glass rounded card
def draw_glass_card(draw, rect, radius=12, fill=(24, 24, 32, 210), border=(255, 255, 255, 24), border_w=1):
    draw.rounded_rectangle(rect, radius=radius, fill=fill, outline=border, width=border_w)

def render_start_page():
    w, h = 1280, 800
    img = Image.new("RGBA", (w, h), (7, 7, 10, 255))
    draw = ImageDraw.Draw(img)

    # 1. Subtle orange ambient glow in background
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse([w//2 - 240, 80, w//2 + 240, 560], fill=(255, 107, 0, 36))
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    img.alpha_composite(glow)

    # 2. Window Chrome & Header (Title bar)
    draw.rectangle([0, 0, w, 44], fill=(12, 12, 16, 240))
    draw.line([0, 44, w, 44], fill=(255, 255, 255, 16), width=1)
    
    # Traffic lights
    draw.ellipse([16, 16, 28, 28], fill=(255, 95, 86))
    draw.ellipse([36, 16, 48, 28], fill=(255, 189, 46))
    draw.ellipse([56, 16, 68, 28], fill=(39, 201, 63))

    # Sreon Brand Mark
    draw.text((86, 14), "SREON", fill=(245, 245, 248))
    draw.text((144, 15), "Powered by SPRFST Language", fill=(255, 161, 54))

    # Active Tab
    draw.rounded_rectangle([340, 8, 540, 38], radius=8, fill=(30, 30, 42, 230), outline=(255, 107, 0, 110), width=1)
    draw.text((356, 15), "⚡ Sreon Start", fill=(245, 245, 248))
    draw.text((518, 14), "✕", fill=(130, 130, 140))

    # Floating Toolbar
    draw.rectangle([0, 45, w, 96], fill=(14, 14, 20, 220))
    draw.line([0, 96, w, 96], fill=(255, 255, 255, 16), width=1)
    
    # Nav arrows
    draw.text((20, 62), "←", fill=(140, 140, 150))
    draw.text((50, 62), "→", fill=(140, 140, 150))
    draw.text((80, 62), "↻", fill=(140, 140, 150))

    # Address bar centerpiece
    draw.rounded_rectangle([130, 52, 980, 88], radius=18, fill=(26, 26, 36, 200), outline=(255, 107, 0, 80), width=1)
    draw.rounded_rectangle([138, 58, 210, 82], radius=12, fill=(255, 107, 0, 36))
    draw.text((148, 63), "⚡ DDG", fill=(255, 161, 54))
    draw.text((224, 63), "🔒 sreon://start", fill=(240, 240, 245))
    draw.rounded_rectangle([880, 58, 968, 82], radius=12, fill=(255, 107, 0, 48), outline=(255, 107, 0, 100))
    draw.text((894, 63), "🛡️ 432", fill=(255, 107, 0))

    # Sidebar rail (left)
    draw.rectangle([0, 97, 58, h - 28], fill=(11, 11, 15, 240))
    draw.line([58, 97, 58, h - 28], fill=(255, 255, 255, 14), width=1)
    rail_icons = ["AI", "Shield", "Saved", "Vault", "Files", "Notes", "Focus", "Split", "Spaces", "Dev", "History", "Tools"]
    for i, ic in enumerate(rail_icons[:8]):
        cy = 115 + i * 50
        if i == 0:
            draw.rounded_rectangle([10, cy - 8, 48, cy + 28], radius=10, fill=(255, 107, 0, 50), outline=(255, 107, 0, 120))
        draw.text((18, cy), ic[:3], fill=(255, 161, 54) if i == 0 else (140, 140, 150))

    # Center Hero Logo & Title
    cx = w // 2 + 29
    # Sreon Geometric Emblem
    emblem_box = [cx - 48, 140, cx + 48, 236]
    draw.rounded_rectangle(emblem_box, radius=22, fill=(14, 14, 19, 240), outline=(255, 107, 0, 140), width=2)
    draw.ellipse([cx - 28, 158, cx + 28, 214], outline=(255, 107, 0, 90), width=2)
    draw.text((cx - 18, 172), "⚡", fill=(255, 161, 54))

    draw.text((cx - 68, 254), "SREON", fill=(255, 255, 255))
    draw.text((cx - 190, 284), "The Next Generation of Browsing · Powered by SPRFST Language", fill=(170, 170, 180))

    # Central search card
    sc_box = [cx - 320, 320, cx + 320, 368]
    draw.rounded_rectangle(sc_box, radius=24, fill=(22, 22, 30, 220), outline=(255, 107, 0, 100), width=1)
    draw.text((cx - 280, 336), "Search the web with DuckDuckGo or enter URL...", fill=(120, 120, 130))
    draw.ellipse([cx + 280, 328, cx + 312, 360], fill=(255, 107, 0))
    draw.text((cx + 292, 335), "→", fill=(0, 0, 0))

    # Favorites Speed-Dial
    fav_y = 398
    draw.text((cx - 320, fav_y), "FAVORITES & WORKSPACES", fill=(130, 130, 140))
    favs = ["GitHub", "Hacker News", "Perplexity", "Apple Dev", "SPRFST Docs", "Sreon Studio"]
    for i, f in enumerate(favs):
        fx = cx - 320 + i * 110
        draw.rounded_rectangle([fx, fav_y + 24, fx + 96, fav_y + 110], radius=14, fill=(24, 24, 34, 180), outline=(255, 255, 255, 20), width=1)
        draw.rounded_rectangle([fx + 24, fav_y + 36, fx + 72, fav_y + 84], radius=10, fill=(255, 255, 255, 12))
        draw.text((fx + 40, fav_y + 52), "★", fill=(255, 161, 54))
        draw.text((fx + 14, fav_y + 92), f[:10], fill=(230, 230, 240))

    # Daily Widgets Row
    w_y = 540
    widgets = [
        ("LOCAL TIME", "12:00:00", "Saturday, Oct 10"),
        ("SREON SHIELD", "432 Trackers", "14.8 MB Saved"),
        ("SPRFST IDE", "Sreon Studio", "30 Ch Guidebook"),
        ("CREATIVE", "Whiteboard", "Infinite Canvas")
    ]
    for i, (tag, t1, t2) in enumerate(widgets):
        wx = cx - 320 + i * 165
        draw.rounded_rectangle([wx, w_y, wx + 152, w_y + 120], radius=14, fill=(22, 22, 30, 180), outline=(255, 255, 255, 20))
        draw.text((wx + 12, w_y + 12), tag, fill=(120, 120, 130))
        draw.text((wx + 12, w_y + 44), t1, fill=(255, 161, 54) if i < 2 else (255, 255, 255))
        draw.text((wx + 12, w_y + 82), t2, fill=(150, 150, 160))

    # Status Bar
    draw.rectangle([0, h - 28, w, h], fill=(10, 10, 14, 250))
    draw.line([0, h - 28, w, h - 28], fill=(255, 255, 255, 14), width=1)
    draw.ellipse([16, h - 18, 22, h - 12], fill=(16, 185, 129))
    draw.text((28, h - 20), "Sreon Engine 1.0.0 · Hardware-accelerated WebKit · Ready", fill=(140, 140, 150))
    draw.text((w - 240, h - 20), "0 ms · 432 rules · 14.8 MB saved", fill=(140, 140, 150))

    p = os.path.join(OUT_DIR, "sreon_start_page.png")
    img.save(p, "PNG")
    print(f"  [✓] Rendered {p}")

def render_studio_ide():
    w, h = 1280, 800
    img = Image.new("RGBA", (w, h), (8, 8, 12, 255))
    draw = ImageDraw.Draw(img)

    # Header
    draw.rectangle([0, 0, w, 44], fill=(12, 12, 16, 240))
    draw.ellipse([16, 16, 28, 28], fill=(255, 95, 86))
    draw.ellipse([36, 16, 48, 28], fill=(255, 189, 46))
    draw.ellipse([56, 16, 68, 28], fill=(39, 201, 63))
    draw.text((86, 14), "SREON STUDIO — BUILT-IN SPRFST IDE", fill=(245, 245, 248))

    # Toolbar
    draw.rectangle([0, 45, w, 82], fill=(14, 14, 20, 240))
    draw.rounded_rectangle([16, 50, 100, 76], radius=6, fill=(255, 107, 0))
    draw.text((36, 56), "▶ Run", fill=(0, 0, 0))
    draw.rounded_rectangle([110, 50, 180, 76], radius=6, fill=(255, 255, 255, 16))
    draw.text((124, 56), "✓ Check", fill=(220, 220, 230))
    draw.rounded_rectangle([190, 50, 260, 76], radius=6, fill=(255, 255, 255, 16))
    draw.text((204, 56), "Format", fill=(220, 220, 230))

    # IDE Sidebar (File Explorer & Guidebook)
    draw.rectangle([0, 83, 260, h - 28], fill=(11, 11, 15, 240))
    draw.line([260, 83, 260, h - 28], fill=(255, 255, 255, 16), width=1)
    draw.text((16, 96), "PROJECT EXPLORER", fill=(120, 120, 130))
    files = ["src/main.spf", "std/core.spf", "std/draw.spf", "std/ai.spf", "guidebook/01-first-steps.md", "guidebook/20-drawing.md"]
    for i, f in enumerate(files):
        draw.text((16, 126 + i * 28), f"⚡ {f}", fill=(255, 161, 54) if i == 0 else (170, 170, 180))

    # Editor surface
    draw.rectangle([261, 83, w, h - 220], fill=(10, 10, 13, 255))
    # Line numbers
    draw.rectangle([261, 83, 310, h - 220], fill=(12, 12, 16, 160))
    for line in range(1, 16):
        draw.text((284, 96 + (line - 1) * 22), str(line), fill=(80, 80, 90))

    # Syntax highlighted code
    code_lines = [
        ("use std.io", (255, 161, 54)),
        ("use std.math", (255, 161, 54)),
        ("", (255, 255, 255)),
        ("fn main() {", (255, 210, 120)),
        ("    let app_name = \"Sreon\"", (230, 230, 235)),
        ("    let engine = \"Powered by SPRFST Language\"", (230, 230, 235)),
        ("    io.say(\"Welcome to {app_name}!\")", (230, 230, 235)),
        ("    io.say(engine)", (230, 230, 235)),
        ("", (255, 255, 255)),
        ("    let nums = [1, 2, 3, 4, 5]", (230, 230, 235)),
        ("    let squared = nums.map(fn(n) => n * n)", (230, 230, 235)),
        ("    io.say(\"Squares: {squared}\")", (230, 230, 235)),
        ("}", (255, 210, 120))
    ]
    for i, (line_text, color) in enumerate(code_lines):
        draw.text((324, 96 + i * 22), line_text, fill=color)

    # Console Drawer (Bottom)
    draw.rectangle([261, h - 220, w, h - 28], fill=(6, 6, 9, 255))
    draw.line([261, h - 220, w, h - 220], fill=(255, 107, 0, 90), width=1)
    draw.text((276, h - 208), "OUTPUT (SPRFST 0.1.0-beta Compiler)", fill=(255, 107, 0))
    draw.text((276, h - 176), "Welcome to Sreon!\nPowered by SPRFST Language\nSquares: [1, 4, 9, 16, 25]\n✓ Process exited 0 (3.2 ms)", fill=(16, 185, 129))

    # Status bar
    draw.rectangle([0, h - 28, w, h], fill=(10, 10, 14, 250))
    draw.text((16, h - 20), "Sreon Studio · SPRFST Language · UTF-8 · Tab Size: 4 · Apple Silicon arm64", fill=(140, 140, 150))

    p = os.path.join(OUT_DIR, "sreon_studio_ide.png")
    img.save(p, "PNG")
    print(f"  [✓] Rendered {p}")

def render_whiteboard():
    w, h = 1280, 800
    img = Image.new("RGBA", (w, h), (8, 8, 11, 255))
    draw = ImageDraw.Draw(img)

    # Grid
    for x in range(0, w, 40):
        draw.line([x, 0, x, h], fill=(255, 255, 255, 10), width=1)
    for y in range(0, h, 40):
        draw.line([0, y, w, y], fill=(255, 255, 255, 10), width=1)

    # Header
    draw.rectangle([0, 0, w, 44], fill=(12, 12, 16, 240))
    draw.text((86, 14), "SREON INFINITE WHITEBOARD & CREATIVE WORKSPACE", fill=(245, 245, 248))

    # Floating glass whiteboard toolbar
    tb_box = [w//2 - 280, 60, w//2 + 280, 104]
    draw.rounded_rectangle(tb_box, radius=22, fill=(20, 20, 28, 230), outline=(255, 107, 0, 120), width=1)
    draw.text((w//2 - 250, 74), "SELECT   PEN   RECT   CIRCLE   ARROW   TEXT   STICKY", fill=(255, 161, 54))

    # Sticky note 1: Architecture
    draw.rounded_rectangle([180, 220, 380, 360], radius=12, fill=(26, 26, 36, 230), outline=(255, 107, 0, 180), width=2)
    draw.text((200, 240), "Sreon UI Shell", fill=(255, 161, 54))
    draw.text((200, 270), "• Dark Glassmorphism\n• 12-Panel Sidebar\n• Unified Address Bar", fill=(220, 220, 230))

    # Arrow 1
    draw.line([380, 290, 520, 290], fill=(255, 107, 0), width=3)
    draw.polygon([(520, 290), (505, 280), (505, 300)], fill=(255, 107, 0))

    # Sticky note 2: SPRFST Engine
    draw.rounded_rectangle([520, 220, 720, 360], radius=12, fill=(26, 26, 36, 230), outline=(59, 130, 246, 180), width=2)
    draw.text((540, 240), "SPRFST Core Engine", fill=(59, 130, 246))
    draw.text((540, 270), "• Register VM\n• Sreon Shield Parser\n• Studio Compiler\n• Bookmarks & Vault", fill=(220, 220, 230))

    # Arrow 2
    draw.line([720, 290, 860, 290], fill=(59, 130, 246), width=3)
    draw.polygon([(860, 290), (845, 280), (845, 300)], fill=(59, 130, 246))

    # Sticky note 3: Native WebKit
    draw.rounded_rectangle([860, 220, 1060, 360], radius=12, fill=(26, 26, 36, 230), outline=(16, 185, 129, 180), width=2)
    draw.text((880, 240), "macOS WKWebView", fill=(16, 185, 129))
    draw.text((880, 270), "• HTML5 & CSS3\n• ES2024 JavaScript\n• Hardware Shield\n• WebGL & Media", fill=(220, 220, 230))

    p = os.path.join(OUT_DIR, "sreon_whiteboard.png")
    img.save(p, "PNG")
    print(f"  [✓] Rendered {p}")

def render_productivity_tools():
    w, h = 1280, 800
    img = Image.new("RGBA", (w, h), (8, 8, 12, 255))
    draw = ImageDraw.Draw(img)

    # Header
    draw.rectangle([0, 0, w, 44], fill=(12, 12, 16, 240))
    draw.text((86, 14), "SREON EVERYDAY PRODUCTIVITY SUITE — 21 UTILITIES", fill=(245, 245, 248))

    # Toolbar
    draw.rectangle([0, 45, w, 90], fill=(14, 14, 20, 240))
    tools_list = ["Calculator", "Unit Converter", "Timezones", "Timer", "Markdown", "JSON Formatter", "Base64", "URL Encoder", "Color Picker", "Diff Viewer"]
    for i, t in enumerate(tools_list):
        tx = 16 + i * 125
        active = (i == 0)
        draw.rounded_rectangle([tx, 52, tx + 115, 82], radius=8, fill=(255, 107, 0, 50) if active else (255, 255, 255, 12), outline=(255, 107, 0, 140) if active else (255, 255, 255, 20))
        draw.text((tx + 12, 62), t, fill=(255, 161, 54) if active else (200, 200, 210))

    # Active tool surface: Calculator & Unit Converter split
    # Left: Calculator
    draw.rounded_rectangle([40, 110, 480, 720], radius=16, fill=(18, 18, 25, 230), outline=(255, 107, 0, 100), width=1)
    draw.rounded_rectangle([60, 130, 460, 220], radius=12, fill=(10, 10, 14, 255))
    draw.text((80, 145), "sin(45°) + sqrt(256) × 3.1415", fill=(130, 130, 140))
    draw.text((80, 175), "= 50.9715", fill=(255, 161, 54))

    # Calc keys
    keys = [
        ["C", "(", ")", "÷"],
        ["7", "8", "9", "×"],
        ["4", "5", "6", "-"],
        ["1", "2", "3", "+"],
        ["0", ".", "√", "="]
    ]
    for r, row in enumerate(keys):
        for c, k in enumerate(row):
            kx = 60 + c * 102
            ky = 240 + r * 92
            is_eq = (k == "=")
            is_op = k in ["÷", "×", "-", "+"]
            draw.rounded_rectangle([kx, ky, kx + 90, ky + 78], radius=10, fill=(255, 107, 0) if is_eq else ((255, 161, 54, 40) if is_op else (255, 255, 255, 16)))
            draw.text((kx + 38, ky + 28), k, fill=(0, 0, 0) if is_eq else (240, 240, 245))

    # Right: Unit Converter & Regex Tester
    draw.rounded_rectangle([520, 110, 1240, 400], radius=16, fill=(18, 18, 25, 230), outline=(255, 255, 255, 20), width=1)
    draw.text((545, 135), "Precision Unit Converter", fill=(255, 255, 255))
    draw.text((545, 175), "Length · Mass · Temperature · Speed · Storage · Energy", fill=(140, 140, 150))
    draw.rounded_rectangle([545, 215, 845, 275], radius=10, fill=(12, 12, 16, 255))
    draw.text((565, 235), "1,024 Megabytes (MB)", fill=(255, 161, 54))
    draw.text((875, 235), "=", fill=(255, 255, 255))
    draw.rounded_rectangle([915, 215, 1215, 275], radius=10, fill=(12, 12, 16, 255))
    draw.text((935, 235), "1.00 Gigabyte (GB)", fill=(16, 185, 129))

    # Lower right: Regex Tester
    draw.rounded_rectangle([520, 430, 1240, 720], radius=16, fill=(18, 18, 25, 230), outline=(255, 255, 255, 20), width=1)
    draw.text((545, 455), "Interactive Regular Expression Tester", fill=(255, 255, 255))
    draw.rounded_rectangle([545, 495, 1215, 545], radius=8, fill=(10, 10, 14, 255))
    draw.text((565, 510), "Pattern: ([a-zA-Z0-9_.+-]+)@([a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+)", fill=(255, 161, 54))
    draw.rounded_rectangle([545, 565, 1215, 680], radius=8, fill=(10, 10, 14, 255))
    draw.text((565, 580), "Matches found: 2\nGroup 1: contact@sreon.ai\nGroup 2: dev@sprfst.org", fill=(16, 185, 129))

    p = os.path.join(OUT_DIR, "sreon_productivity_tools.png")
    img.save(p, "PNG")
    print(f"  [✓] Rendered {p}")

def main():
    print("Rendering high-resolution Sreon preview photos...")
    render_start_page()
    render_studio_ide()
    render_whiteboard()
    render_productivity_tools()
    print("All sample photos generated!")

if __name__ == "__main__":
    main()
