#!/usr/bin/env python3
"""Build 'os.pdf' - a visual, plain-language explainer of OS development."""

import os
import math
import random
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                Spacer, PageBreak, NextPageTemplate, Flowable)

ROOT = os.path.dirname(os.path.abspath(__file__))
ASSETS = ROOT
OUT = os.path.join(os.path.dirname(ROOT), "os.pdf")

PAGE_W, PAGE_H = A4

NAVY   = HexColor("#1F2A44")
TEAL   = HexColor("#1B9AAA")
ORANGE = HexColor("#F4845F")
GOLD   = HexColor("#F4B860")
CREAM  = HexColor("#FFF7EC")
LIGHT  = HexColor("#E7F6F7")
PINKBG = HexColor("#FDEEE8")
GREEN  = HexColor("#3AAE8C")
GREY   = HexColor("#6B7280")
LIGHTGREY = HexColor("#D9DEE7")

def st(name, **kw):
    base = dict(fontName="Helvetica", fontSize=13.5, leading=20, textColor=NAVY)
    base.update(kw)
    return ParagraphStyle(name, **base)

S_BODY   = st("body", spaceAfter=10)
S_H1     = st("h1", fontName="Helvetica-Bold", fontSize=22, leading=27, textColor=white)
S_TOC    = st("toc", fontSize=13.5, leading=22)
S_CAP    = st("cap", fontName="Helvetica-Oblique", fontSize=11, leading=15,
              textColor=GREY, alignment=TA_CENTER, spaceBefore=4)
S_BOXH   = st("boxh", fontName="Helvetica-Bold", fontSize=13, leading=17)
S_BOXT   = st("boxt", fontSize=12, leading=17)
S_COVER1 = st("cv1", fontName="Helvetica-Bold", fontSize=40, leading=46,
              textColor=white, alignment=TA_CENTER)
S_COVER2 = st("cv2", fontName="Helvetica", fontSize=16, leading=22,
              textColor=CREAM, alignment=TA_CENTER)
S_COVER3 = st("cv3", fontName="Helvetica-Oblique", fontSize=12, leading=17,
              textColor=HexColor("#EFE7DA"), alignment=TA_CENTER)

def body(text):
    return Paragraph(text, S_BODY)

class RoundedBox(Flowable):
    def __init__(self, title, text, bg, accent, width=None):
        super().__init__()
        self.bg = bg
        self.accent = accent
        self.box_width = width
        self.para = Paragraph(text, S_BOXT)
        self.titlep = Paragraph(title, S_BOXH)

    def wrap(self, aw, ah):
        self.w = self.box_width or aw
        inner = self.w - 1.6 * cm
        _, th = self.para.wrap(inner, ah)
        _, tyh = self.titlep.wrap(inner, ah)
        self.h = th + tyh + 1.1 * cm
        return self.w, self.h

    def draw(self):
        c = self.canv
        c.setFillColor(self.bg)
        c.setStrokeColor(self.accent)
        c.setLineWidth(1.5)
        c.roundRect(0, 0, self.w, self.h, 10, stroke=1, fill=1)
        c.setFillColor(self.accent)
        c.roundRect(0, self.h - 0.55 * cm, self.w, 0.55 * cm, 10, stroke=0, fill=1)
        c.rect(0, self.h - 0.55 * cm, self.w, 0.2 * cm, stroke=0, fill=1)
        self.titlep.drawOn(self.canv, 0.8 * cm, self.h - 1.15 * cm)
        self.para.drawOn(self.canv, 0.8 * cm, 0.45 * cm)

class ChapterTitle(Flowable):
    def __init__(self, num, title, color, width=None):
        super().__init__()
        self.num = str(num)
        self.title = title
        self.color = color
        self.bar_width = width

    def wrap(self, aw, ah):
        self.w = self.bar_width or aw
        self.p = Paragraph(self.title, S_H1)
        _, ph = self.p.wrap(self.w - 3.2 * cm, ah)
        self.h = max(ph + 1.2 * cm, 2.2 * cm)
        return self.w, self.h

    def draw(self):
        c = self.canv
        c.setFillColor(self.color)
        c.roundRect(0, 0, self.w, self.h, 12, stroke=0, fill=1)
        c.setFillColor(white)
        c.circle(1.35 * cm, self.h / 2, 0.85 * cm, stroke=0, fill=1)
        c.setFillColor(self.color)
        c.setFont("Helvetica-Bold", 20 if len(self.num) < 2 else 16)
        c.drawCentredString(1.35 * cm, self.h / 2 - 0.28 * cm, self.num)
        self.p.drawOn(c, 2.75 * cm, (self.h - self.p.height) / 2)

class Picture(Flowable):
    def __init__(self, path, caption=None, width=13.5 * cm):
        super().__init__()
        self.path = path
        self.caption = caption
        self.disp_w = width
        self.img = ImageReader(path)
        iw, ih = self.img.getSize()
        self.disp_h = self.disp_w * ih / iw
        self.cap_p = Paragraph(caption, S_CAP) if caption else None

    def wrap(self, aw, ah):
        self.w = aw
        ch = 0
        if self.cap_p:
            _, ch = self.cap_p.wrap(aw, ah)
        self.cap_h = ch + 6
        self.h = self.disp_h + self.cap_h
        return aw, self.h

    def draw(self):
        c = self.canv
        x = (self.w - self.disp_w) / 2
        c.setFillColor(HexColor("#E8E2D8"))
        c.roundRect(x + 4, self.cap_h - 3, self.disp_w, self.disp_h, 12, stroke=0, fill=1)
        c.drawImage(self.path, x, self.cap_h, self.disp_w, self.disp_h,
                    mask="auto", preserveAspectRatio=True, anchor="c")
        c.setStrokeColor(LIGHTGREY)
        c.setLineWidth(1)
        c.roundRect(x, self.cap_h, self.disp_w, self.disp_h, 12, stroke=1, fill=0)
        if self.cap_p:
            self.cap_p.drawOn(c, 0, 2)

class CodeBlock(Flowable):
    """A pretty box of monospace code."""
    def __init__(self, code, caption=None, font_size=8.3):
        super().__init__()
        self.code = code.strip("\n")
        self.fs = font_size
        self.caption = caption
        self.cap_p = Paragraph(caption, S_CAP) if caption else None

    def wrap(self, aw, ah):
        self.w = aw
        ch = 0
        if self.cap_p:
            _, ch = self.cap_p.wrap(aw, ah)
        self.cap_h = ch + 4
        self.n_lines = self.code.count("\n") + 1
        self.line_h = self.fs * 1.32
        self.h = self.n_lines * self.line_h + 0.55 * cm + self.cap_h
        return aw, self.h

    def draw(self):
        c = self.canv
        box_h = self.h - self.cap_h
        c.setFillColor(HexColor("#F6F3EC"))
        c.setStrokeColor(HexColor("#C9CFDA"))
        c.setLineWidth(1)
        c.roundRect(0, self.cap_h, self.w, box_h, 8, stroke=1, fill=1)
        c.setFillColor(TEAL)
        c.roundRect(0, self.cap_h, 0.22 * cm, box_h, 8, stroke=0, fill=1)
        c.rect(0, self.cap_h + 8, 0.22 * cm, box_h - 16, stroke=0, fill=1)
        y = self.cap_h + box_h - 0.42 * cm
        for line in self.code.split("\n"):
            stripped = line.strip()
            if stripped.startswith(";") or stripped.startswith("//") or \
               stripped.startswith("/*") or stripped.startswith("*") or \
               stripped.startswith("# "):
                c.setFillColor(HexColor("#6E8B5B"))
                c.setFont("Courier-Oblique", self.fs)
            elif stripped.startswith("#"):
                c.setFillColor(ORANGE)
                c.setFont("Courier-Bold", self.fs)
            else:
                c.setFillColor(NAVY)
                c.setFont("Courier", self.fs)
            c.drawString(0.5 * cm, y, line.replace("\t", "    "))
            y -= self.line_h
        if self.cap_p:
            self.cap_p.drawOn(c, 0, 0)


class PartBanner(Flowable):
    """Big divider banner: PART TWO - ..."""
    def __init__(self, part, title, subtitle, color, width=None):
        super().__init__()
        self.part = part
        self.title = title
        self.subtitle = subtitle
        self.color = color
        self.bar_width = width

    def wrap(self, aw, ah):
        self.w = self.bar_width or aw
        self.h = 5.2 * cm
        return self.w, self.h

    def draw(self):
        c = self.canv
        c.setFillColor(self.color)
        c.roundRect(0, 1.2 * cm, self.w, 4.0 * cm, 16, stroke=0, fill=1)
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 15)
        c.drawCentredString(self.w / 2, 4.35 * cm, self.part)
        c.setFont("Helvetica-Bold", 26)
        c.drawCentredString(self.w / 2, 3.25 * cm, self.title)
        c.setFont("Helvetica", 12.5)
        c.drawCentredString(self.w / 2, 2.35 * cm, self.subtitle)
        c.setFillColor(GOLD)
        c.roundRect(self.w / 2 - 3.2 * cm, 1.55 * cm, 6.4 * cm, 0.22 * cm,
                    4, stroke=0, fill=1)


class Diagram(Flowable):
    def __init__(self, height):
        super().__init__()
        self.dheight = height

    def wrap(self, aw, ah):
        self.w = aw
        return aw, self.dheight

    def rounded_box(self, x, y, w, h, fill, label, sub=None, tcol=white, fs=12):
        c = self.canv
        c.setFillColor(fill)
        c.roundRect(x, y, w, h, 10, stroke=0, fill=1)
        c.setFillColor(tcol)
        c.setFont("Helvetica-Bold", fs)
        if sub:
            c.drawCentredString(x + w / 2, y + h / 2 + 4, label)
            c.setFont("Helvetica", fs - 2.5)
            c.drawCentredString(x + w / 2, y + h / 2 - fs + 2, sub)
        else:
            c.drawCentredString(x + w / 2, y + h / 2 - fs / 3, label)

    def arrow(self, x1, y1, x2, y2, col=NAVY, w=2.2):
        c = self.canv
        c.setStrokeColor(col)
        c.setFillColor(col)
        c.setLineWidth(w)
        c.line(x1, y1, x2, y2)
        ang = math.atan2(y2 - y1, x2 - x1)
        size = 9
        p = c.beginPath()
        p.moveTo(x2, y2)
        p.lineTo(x2 - size * math.cos(ang - 0.42), y2 - size * math.sin(ang - 0.42))
        p.lineTo(x2 - size * math.cos(ang + 0.42), y2 - size * math.sin(ang + 0.42))
        p.close()
        c.drawPath(p, stroke=0, fill=1)

    def label(self, x, y, text, fs=10, col=NAVY, font="Helvetica-Oblique", anchor="c"):
        c = self.canv
        c.setFillColor(col)
        c.setFont(font, fs)
        if anchor == "c":
            c.drawCentredString(x, y, text)
        else:
            c.drawString(x, y, text)

class BootDiagram(Diagram):
    def __init__(self):
        super().__init__(5.2 * cm)

    def draw(self):
        steps = [
            ("1. Power on", "the computer yawns", ORANGE),
            ("2. BIOS", "built-in wake-up check", TEAL),
            ("3. GRUB", "the delivery driver", GOLD),
            ("4. Your OS", "the real boss arrives", GREEN),
        ]
        w = self.w
        n = len(steps)
        gap = 0.55 * cm
        bw = (w - gap * (n - 1)) / n
        bh = 2.0 * cm
        y = 2.2 * cm
        for i, (t, s, col) in enumerate(steps):
            x = i * (bw + gap)
            self.rounded_box(x, y, bw, bh, col, t, s, tcol=white, fs=11.5)
            if i < n - 1:
                self.arrow(x + bw + 4, y + bh / 2, x + bw + gap - 4, y + bh / 2)
        self.label(w / 2, 1.15 * cm,
                   "Each one hands the baton to the next, until the operating system takes over.",
                   fs=11)
        self.label(w / 2, 0.4 * cm, "Just like a relay race at school sports day!",
                   fs=10.5, col=GREY)

class FramebufferDiagram(Diagram):
    def __init__(self):
        super().__init__(6.6 * cm)

    def draw(self):
        cols, rows = 24, 8
        cell = 0.5 * cm
        gw, gh = cols * cell, rows * cell
        x0 = (self.w - gw) / 2
        y0 = 1.55 * cm
        random.seed(7)
        palette = [TEAL, ORANGE, GOLD, GREEN, NAVY]
        for r in range(rows):
            for c_ in range(cols):
                lit = random.random() < 0.42
                x = x0 + c_ * cell
                y = y0 + (rows - 1 - r) * cell
                self.canv.setFillColor(
                    palette[(r * cols + c_) % len(palette)] if lit else HexColor("#F2EFE9"))
                self.canv.setStrokeColor(HexColor("#C9CFDA"))
                self.canv.setLineWidth(0.6)
                self.canv.rect(x, y, cell - 1.5, cell - 1.5, stroke=1, fill=1)
        self.label(self.w / 2, y0 + gh + 0.5 * cm,
                   "The screen = a light board of 80 x 25 tiles (here: a tiny sample)", fs=11)
        self.label(self.w / 2, 1.05 * cm,
                   "Each tile holds: one letter + its colors, packed into 2 tiny bytes",
                   fs=10.5, col=GREY)
        self.label(self.w / 2, 0.4 * cm,
                   "Write to memory spot 0xB8000 - and the tiles light up!",
                   fs=10.5, col=GREY)

class PagingDiagram(Diagram):
    def __init__(self):
        super().__init__(6.3 * cm)

    def draw(self):
        w = self.w
        y = 2.6 * cm
        self.rounded_box(0.2 * cm, y, 4.4 * cm, 2.0 * cm, ORANGE,
                         "Fake address", '"locker 101"', fs=12)
        self.rounded_box(w / 2 - 3.1 * cm, y - 0.3 * cm, 6.2 * cm, 2.6 * cm, NAVY,
                         "THE BIG CATALOG", "page tables + MMU", fs=13)
        self.rounded_box(w - 4.6 * cm, y, 4.4 * cm, 2.0 * cm, TEAL,
                         "Real box", "shelf 45067", fs=12)
        self.arrow(4.8 * cm, y + 1.0 * cm, w / 2 - 3.3 * cm, y + 1.0 * cm, col=ORANGE, w=2.6)
        self.arrow(w / 2 + 3.3 * cm, y + 1.0 * cm, w - 4.8 * cm, y + 1.0 * cm, col=TEAL, w=2.6)
        self.label(w / 2, y + 2.95 * cm,
                   "Every program thinks it owns the whole building - the catalog quietly redirects.",
                   fs=11)
        self.label(2.4 * cm, y - 1.05 * cm, "what the program says", fs=10, col=GREY)
        self.label(w - 2.4 * cm, y - 1.05 * cm, "what actually happens", fs=10, col=GREY)
        self.label(w / 2, 0.45 * cm,
                   'Knock on a locker that was never rented? BEEP! That is a "page fault".',
                   fs=10.5, col=GREY)

class TimelineDiagram(Diagram):
    def __init__(self):
        super().__init__(5.4 * cm)

    def draw(self):
        w = self.w
        rows = [("Process A", TEAL, [0, 0.28, 0.56]),
                ("Process B", ORANGE, [0.14, 0.42, 0.70]),
                ("Process C", GREEN, [0.21, 0.49, 0.84])]
        x0 = 3.2 * cm
        x1 = w - 0.6 * cm
        span = x1 - x0
        y = 3.5 * cm
        for name, col, starts in rows:
            self.label(1.5 * cm, y + 0.22 * cm, name, fs=11, col=NAVY,
                       font="Helvetica-Bold", anchor="c")
            self.canv.setFillColor(HexColor("#F2EFE9"))
            self.canv.roundRect(x0, y, span, 0.75 * cm, 4, stroke=0, fill=1)
            for s in starts:
                self.canv.setFillColor(col)
                self.canv.roundRect(x0 + s * span, y, span * 0.12, 0.75 * cm, 4,
                                    stroke=0, fill=1)
            y -= 1.15 * cm
        self.canv.setStrokeColor(NAVY)
        self.canv.setLineWidth(1.2)
        self.canv.setDash([3, 2])
        for t in (0.14, 0.28, 0.42, 0.56, 0.70, 0.84):
            self.canv.line(x0 + t * span, 1.15 * cm, x0 + t * span, 4.5 * cm)
        self.canv.setDash([])
        self.label(x0 + span * 0.5, 0.8 * cm,
                   "The little clock rings - and the next one gets a turn", fs=11)
        self.label(x0 + span * 0.5, 0.25 * cm,
                   "So fast that it LOOKS like they all work at the same time",
                   fs=10.5, col=GREY)

class LoadDiagram(Diagram):
    def __init__(self):
        super().__init__(4.6 * cm)

    def draw(self):
        w = self.w
        y = 1.9 * cm
        boxes = [
            ("Program file", "sitting on the disc", GOLD),
            ("Copy to memory", "unpack the box", ORANGE),
            ("Jump to start", '"GO!" - it runs', GREEN),
        ]
        bw = 4.6 * cm
        gap = (w - 3 * bw) / 4
        for i, (t, s, col) in enumerate(boxes):
            x = gap + i * (bw + gap)
            self.rounded_box(x, y, bw, 1.9 * cm, col, t, s, fs=12)
            if i < 2:
                self.arrow(x + bw + 4, y + 0.95 * cm, x + bw + gap - 4, y + 0.95 * cm)
        self.label(w / 2, 1.05 * cm,
                   'The book uses GRUB "modules": the delivery driver drops the package',
                   fs=11)
        self.label(w / 2, 0.4 * cm,
                   "in memory before the OS even starts. Easy peasy!", fs=10.5, col=GREY)

class LayerDiagram(Diagram):
    def __init__(self):
        super().__init__(5.5 * cm)

    def draw(self):
        w = self.w
        layers = [
            ("Your apps and games", GOLD, NAVY),
            ("The OPERATING SYSTEM  -  the boss of the computer", TEAL, white),
            ("Hardware: screen - keyboard - memory - disks", NAVY, white),
        ]
        y = 3.85 * cm
        for t, col, tc in layers:
            self.canv.setFillColor(col)
            self.canv.roundRect(1.2 * cm, y, w - 2.4 * cm, 1.15 * cm, 10, stroke=0, fill=1)
            self.canv.setFillColor(tc)
            self.canv.setFont("Helvetica-Bold", 13)
            self.canv.drawCentredString(w / 2, y + 0.42 * cm, t)
            y -= 1.5 * cm
        self.label(w / 2, 0.35 * cm,
                   "The book builds that middle layer from scratch - the boss itself!",
                   fs=11, col=GREY)

def cover_page(canv, doc):
    canv.saveState()
    canv.setFillColor(NAVY)
    canv.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    canv.setFillColor(HexColor("#2A3A63"))
    canv.circle(PAGE_W * 0.12, PAGE_H * 0.88, 3.2 * cm, stroke=0, fill=1)
    canv.circle(PAGE_W * 0.92, PAGE_H * 0.75, 2.4 * cm, stroke=0, fill=1)
    canv.circle(PAGE_W * 0.85, PAGE_H * 0.12, 3.8 * cm, stroke=0, fill=1)
    canv.setFillColor(TEAL)
    canv.circle(PAGE_W * 0.10, PAGE_H * 0.16, 1.6 * cm, stroke=0, fill=1)
    canv.setFillColor(ORANGE)
    canv.circle(PAGE_W * 0.22, PAGE_H * 0.08, 1.0 * cm, stroke=0, fill=1)
    canv.setFillColor(GOLD)
    canv.circle(PAGE_W * 0.05, PAGE_H * 0.42, 0.55 * cm, stroke=0, fill=1)
    canv.setFillColor(TEAL)
    canv.rect(0, 0, PAGE_W, 1.1 * cm, stroke=0, fill=1)
    canv.setFillColor(GOLD)
    canv.rect(0, 0, PAGE_W, 0.35 * cm, stroke=0, fill=1)
    canv.restoreState()

def body_page(canv, doc):
    canv.saveState()
    canv.setFillColor(NAVY)
    canv.rect(0, PAGE_H - 0.75 * cm, PAGE_W, 0.75 * cm, stroke=0, fill=1)
    canv.setFillColor(TEAL)
    canv.rect(0, PAGE_H - 0.9 * cm, PAGE_W, 0.15 * cm, stroke=0, fill=1)
    canv.setFillColor(CREAM)
    canv.setFont("Helvetica", 9)
    canv.drawString(1.2 * cm, PAGE_H - 0.52 * cm,
                    "How a Computer Wakes Up  -  OS development for everyone")
    canv.setFillColor(NAVY)
    canv.setFont("Helvetica", 9.5)
    canv.drawCentredString(PAGE_W / 2, 0.75 * cm, "- %d -" % canv.getPageNumber())
    canv.setFillColor(TEAL)
    canv.rect(0, 0, PAGE_W, 0.18 * cm, stroke=0, fill=1)
    canv.restoreState()

def build():
    doc = BaseDocTemplate(OUT, pagesize=A4,
                          leftMargin=1.7 * cm, rightMargin=1.7 * cm,
                          topMargin=1.8 * cm, bottomMargin=1.5 * cm,
                          title="How a Computer Wakes Up - OS Development for Everyone",
                          author="Explainer based on The Little Book About OS Development")
    cover_frame = Frame(2 * cm, 1.6 * cm, PAGE_W - 4 * cm, PAGE_H - 3.2 * cm, id="cover")
    body_frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="body")
    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[cover_frame], onPage=cover_page),
        PageTemplate(id="body", frames=[body_frame], onPage=body_page),
    ])

    story = []
    W = doc.width
    A = ASSETS

    # ===== COVER =====
    story.append(Spacer(1, 1.1 * cm))
    story.append(Paragraph("HOW A COMPUTER<br/>WAKES UP", S_COVER1))
    story.append(Spacer(1, 0.45 * cm))
    story.append(Paragraph("The picture guide to OS development - plus a complete coding course"
                           "<br/>so you can BUILD one on your Mac", S_COVER2))
    story.append(Spacer(1, 0.8 * cm))
    story.append(Picture(os.path.join(A, "cover.jpg"), width=11 * cm))
    story.append(Spacer(1, 0.5 * cm))
    story.append(Paragraph(
        "Based on &ldquo;The Little Book About OS Development&rdquo;<br/>"
        "by Erik Helin &amp; Adam Renberg (2015)<br/><br/>"
        "Zero coding knowledge needed - just curiosity!", S_COVER3))
    story.append(NextPageTemplate("body"))
    story.append(PageBreak())

    # ===== CONTENTS =====
    story.append(ChapterTitle("?", "What's inside this mini-book", TEAL, width=W))
    story.append(Spacer(1, 0.5 * cm))
    toc_items = [
        ("part", "PART ONE - THE BIG PICTURE", ""),
        ("1", "What even IS an operating system?", "the boss inside your computer"),
        ("2", "How a computer wakes up", "power button - BIOS - GRUB - your OS"),
        ("3", "The secret handshake", "hello, 0xCAFEBABE!"),
        ("4", "Talking to the screen", "a giant board of light-up tiles"),
        ("5", "Keeping a diary", "the serial port logbook"),
        ("6", "Dividing up the big room", "segmentation"),
        ("7", "Ding-dong! Interrupts", "how the keyboard gets attention"),
        ("8", "Two uniforms", "boss mode vs visitor mode"),
        ("9", "Fake addresses", "paging &amp; virtual memory"),
        ("10", "The landlord", "handing out memory rooms"),
        ("11", "Unpacking a program", "loading and running code"),
        ("12", "Filing cabinets", "file systems"),
        ("13", "Ringing the service bell", "system calls"),
        ("14", "Doing everything at once", "multitasking"),
        ("15", "You made it!", "the whole journey in one breath"),
        ("part", "PART TWO - LEARN TO CODE, FROM ZERO", ""),
        ("16", "What programming really is", "recipes for a very obedient helper"),
        ("17", "Your first C programs", "values, variables, choices and loops"),
        ("18", "Functions", "recipes inside recipes"),
        ("19", "Memory, pointers and structs", "the mailboxes behind it all"),
        ("20", "Compiler, linker and Make", "from text file to running program"),
        ("21", "Assembly in one sitting", "the CPU's own language"),
        ("22", "Set up your Mac workshop", "tools, folders and make run"),
        ("part", "PART THREE - BUILD YOUR OS, MILESTONE BY MILESTONE", ""),
        ("23", "Milestone 0: the spark", "loader.s, link.ld and QEMU"),
        ("24", "Milestone 1: your C code runs", "kmain and the magic flags"),
        ("25", "Milestone 2: the screen driver", "letters on the light board"),
        ("26", "Milestone 3: the logbook", "the serial port driver"),
        ("27", "Milestone 4: the boss's uniform", "the GDT, for real"),
        ("28", "Milestone 5: doorbells", "IDT, PIC and exceptions"),
        ("29", "Milestone 6: your OS reads keys", "the keyboard driver"),
        ("30", "Milestone 7: fake addresses on", "paging"),
        ("31", "Milestone 8: the landlord", "the page-frame allocator"),
        ("32", "Milestone 9: user mode!", "system calls and your first app"),
        ("33", "Your finished OS", "debugging cookbook &amp; next steps"),
    ]
    for n, t, sub in toc_items:
        if n == "part":
            story.append(Spacer(1, 0.22 * cm))
            story.append(Paragraph(
                f'<font color="#1B9AAA"><b>{t}</b></font>',
                ParagraphStyle("tocpart", fontName="Helvetica-Bold",
                               fontSize=12.5, leading=18, textColor=NAVY,
                               spaceBefore=6, spaceAfter=2)))
            continue
        story.append(Paragraph(
            f'<font color="#1B9AAA"><b>[{n}]</b></font>&nbsp;&nbsp;<b>{t}</b>'
            f'&nbsp;&mdash;&nbsp;<i>{sub}</i>', S_TOC))
    story.append(Spacer(1, 0.4 * cm))
    story.append(RoundedBox(
        "How to read this",
        "Each chapter is short. The pictures carry the ideas, and the words use everyday "
        "language - relay races, landlords, doorbells and filing cabinets. Whenever the "
        "real book uses a scary word, we translate it here.",
        CREAM, GOLD, width=W))

    # ===== CH 1 =====
    story.append(PageBreak())
    story.append(ChapterTitle(1, "What even IS an operating system?", TEAL, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "Imagine a brand-new computer straight from the factory. It has a brain (the processor), "
        "a big desk for papers (memory), a screen, a keyboard... but it just sits there. "
        "It has no idea how to show you anything or listen to you."))
    story.append(body(
        "An <b>operating system</b> (OS) is the <b>boss program</b> that moves in and runs the whole "
        "place. It decides who gets to use the desk space, it draws letters on the screen, it listens "
        "to the keyboard, it keeps your files tidy, and it makes sure programs don't fight."))
    story.append(LayerDiagram())
    story.append(Spacer(1, 0.3 * cm))
    story.append(RoundedBox(
        "In plain words",
        "The processor is the worker. Memory is the desk. The screen and keyboard are the doors and "
        "windows. The operating system is the manager who knows how everything fits together.",
        LIGHT, TEAL, width=W))
    story.append(Spacer(1, 0.35 * cm))
    story.append(body(
        "The little book you read teaches you to BUILD that boss, starting from absolutely nothing. "
        "Not by memorizing theory - by actually making it, one tiny step at a time. Its best tip: "
        "after every small step, test it. Then, if something breaks, you know exactly which step "
        "broke it."))

    # ===== CH 2 =====
    story.append(PageBreak())
    story.append(ChapterTitle(2, "How a computer wakes up", ORANGE, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "Pressing the power button does not magically start your OS. It is more like a relay race - "
        "a chain of tiny programs, each one waking up the next, bigger one:"))
    story.append(BootDiagram())
    story.append(body(
        "<b>BIOS</b> is the first runner. It is built into the hardware itself, like a wake-up alarm "
        "glued inside the machine. It stretches a little (&ldquo;is the keyboard there? the screen? "
        "OK!&rdquo;) and then hands over."))
    story.append(body(
        "The <b>bootloader</b> is the second runner. Its whole life purpose is to find an operating "
        "system and get it onto the stage. Writing one is fiddly work, so the book uses a famous "
        "existing one: <b>GRUB</b>. Think of GRUB as a delivery driver who already knows where the "
        "boss's office is - he carries your OS into memory (the big desk) and says: &ldquo;Go!&rdquo;"))
    story.append(RoundedBox(
        "Fun fact",
        "The very first runner must squeeze into a tiny 512-byte mailbox on the disk - about the "
        "size of one short text message! That is why nobody writes bootloaders just for fun.",
        PINKBG, ORANGE, width=W))

    # ===== CH 3 =====
    story.append(PageBreak())
    story.append(ChapterTitle(3, "The secret handshake: Hello, 0xCAFEBABE!", GOLD, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(Picture(os.path.join(A, "hello.jpg"),
                         "Before GRUB starts your code, it checks the secret password at the door.",
                         width=11 * cm))
    story.append(body(
        "GRUB is careful. Before it jumps to your code, it looks for a <b>magic number</b> - a secret "
        "password written at the very top of your program. The password is <b>0x1BADB002</b> "
        "(hex-speak for a memorable handshake), and the tradition is to answer with a second funny "
        "number when you succeed: <b>0xCAFEBABE</b>. Yes, really - it reads like &ldquo;cafe "
        "babe&rdquo;. Programmers have a sense of humor too."))
    story.append(body(
        "The tiniest possible OS does just one thing: it writes 0xCAFEBABE into the CPU's hand and "
        "waves forever. The CPU's &ldquo;hands&rdquo; are called <b>registers</b> - tiny name-tag "
        "slots where it holds the number it is working with right now."))
    story.append(RoundedBox(
        "How do we know it worked?",
        "The pretend computer (a simulator called Bochs) can print out all its registers when you "
        "stop it. If you see CAFEBABE sitting in one of them - your code ran! That is the "
        "&ldquo;Hello, world!&rdquo; of operating systems. Smallest OS ever: it does absolutely "
        "nothing, and everyone is thrilled.",
        LIGHT, GOLD, width=W))

    # ===== CH 4 =====
    story.append(PageBreak())
    story.append(ChapterTitle(4, "Talking to the screen", TEAL, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(Picture(os.path.join(A, "screen.jpg"),
                         "The text screen works like a board of light-up tiles.", width=10.8 * cm))
    story.append(body(
        "How does a letter appear on the screen? The text screen is really just a <b>giant light "
        "board</b>: 80 tiles across, 25 tiles down - 2,000 tiles in total. Each tile holds one letter "
        "plus its colors, packed into 2 tiny bytes (a byte = 8 tiny on/off switches)."))
    story.append(FramebufferDiagram())
    story.append(body(
        "Here is the sneaky trick: the screen is wired to a fixed spot in memory - spot number "
        "<b>0xB8000</b> (that is just its locker number). Write a letter's code there... and it "
        "instantly lights up on the real screen! Writing to memory IS talking to the screen."))
    story.append(body(
        "The blinking cursor is shyer - it is not driven by memory but through a side door called an "
        "<b>I/O port</b> (two little numbered chutes, 0x3D4 and 0x3D5). Your code slips a note "
        "through the chute: &ldquo;cursor, please move to tile 80&rdquo;."))
    story.append(RoundedBox(
        "What is a &ldquo;driver&rdquo;?",
        "Instead of every part of your OS whispering hardware numbers, you write one helpful "
        "middleman - a DRIVER. The rest of the system just says &ldquo;print this sentence, "
        "please&rdquo; and the driver handles the nerdy details. Same idea as a TV remote: one "
        "friendly button, complicated magic inside.",
        LIGHT, TEAL, width=W))

    # ===== CH 5 =====
    story.append(PageBreak())
    story.append(ChapterTitle(5, "Keeping a diary: the serial port", ORANGE, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "When things go wrong, it really helps to know what your OS was doing. Enter the <b>serial "
        "port</b> - an old-fashioned plug that speaks in a steady stream of bytes, like a telegraph "
        "line or a walkie-talkie channel."))
    story.append(body(
        "Neat trick: the pretend computer Bochs can be told to &ldquo;write down everything said on "
        "that line into a file&rdquo;. Boom - a <b>logbook</b>! Or like an airplane's black box: "
        "whatever your OS did, it leaves a trail you can read afterwards."))
    story.append(RoundedBox(
        "Before chatting, agree on how",
        "Two radios must tune to the same channel before they can talk. The serial port needs setup "
        "too: how FAST we speak (the speed), how we double-check for mistakes (parity &amp; stop "
        "bits), and how big the in-tray is (buffers). The book walks through each dial - then builds "
        "a driver with a nice DEBUG / INFO / ERROR log function, just like real software.",
        PINKBG, ORANGE, width=W))
    story.append(Spacer(1, 0.35 * cm))
    story.append(body(
        "With a screen driver AND a diary driver, the OS can finally say where it is and what it "
        "sees. From here on, whenever we hit a bug, the diary will save us hours of guessing."))

    # ===== CH 6 =====
    story.append(PageBreak())
    story.append(ChapterTitle(6, "Dividing up the big room: segmentation", GOLD, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(Picture(os.path.join(A, "memory.jpg"),
                         "Memory: one giant warehouse - segmentation paints it into zones.",
                         width=11.8 * cm))
    story.append(body(
        "<b>Memory</b> is one gigantic warehouse of tiny lockers, all numbered. Without rules, "
        "anything could scribble anywhere - one grumpy program could erase everyone else's work."))
    story.append(body(
        "<b>Segmentation</b> is like painting the warehouse floor into colored zones: "
        "&ldquo;program code lives here&rdquo;, &ldquo;data lives there&rdquo;, &ldquo;boss-only "
        "area&rdquo;. Each zone has a starting point, a size limit, and a permission level. The CPU "
        "carries six little <b>name tags</b> (called segment registers) that say which zone it is "
        "currently allowed into."))
    story.append(RoundedBox(
        "Boss level 0, visitor level 3",
        "x86 chips have four &ldquo;privilege levels&rdquo; numbered 0 to 3, where 0 is the supreme "
        "boss and 3 is the visitor badge. The OS builds its zones at level 0. Later, programs run at "
        "level 3 and simply CANNOT barge into boss areas - the hardware itself blocks the door.",
        LIGHT, GOLD, width=W))
    story.append(body(
        "Honestly? Modern systems barely use segmentation - everyone switched to the next trick "
        "(paging, coming soon). But you still need a minimal setup with the right name tags, so we "
        "do exactly that: two zones (code + data), just enough to get the privilege levels working."))

    # ===== CH 7 =====
    story.append(PageBreak())
    story.append(ChapterTitle(7, "Ding-dong! Interrupts &amp; the keyboard", TEAL, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(Picture(os.path.join(A, "interrupts.jpg"),
                         "An interrupt is a doorbell: &ldquo;Stop a second - the keyboard needs you!&rdquo;",
                         width=11 * cm))
    story.append(body(
        "The CPU is a busy worker that could compute forever. But you just pressed a key! How does "
        "anyone get its attention? With a <b>doorbell</b>. In computer speak: an <b>interrupt</b>."))
    story.append(body(
        "When a key is pressed (or a timer rings, or a wire has news), the hardware goes DING. The "
        "CPU pauses, looks up &ldquo;who handles this doorbell?&rdquo; in a big phone book (the "
        "<b>IDT</b> - Interrupt Descriptor Table), runs that helper routine, then returns to its own "
        "work <i>exactly</i> where it left off - mid-thought, registers and all."))
    story.append(RoundedBox(
        "The mailroom (PIC) and the keyboard's secret code",
        "A little sorter chip called the <b>PIC</b> decides whose ring gets through (you don't want "
        "doorbells from broken devices you cannot answer). And here is a surprise: the keyboard does "
        "NOT send letters - it sends <b>scan codes</b>, like Morse tap-patterns. Your OS must "
        "translate tap #30 into &ldquo;a&rdquo;. Also: always say &ldquo;thanks, got it!&rdquo; back "
        "to the PIC, or it will not ring again!",
        PINKBG, TEAL, width=W))

    # ===== CH 8 =====
    story.append(PageBreak())
    story.append(ChapterTitle(8, "Two uniforms: boss mode vs visitor mode", ORANGE, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(Picture(os.path.join(A, "modes.jpg"),
                         "The castle keeps the master keys inside - visitors stay in the village.",
                         width=11 * cm))
    story.append(body(
        "Remember the privilege levels? Now they matter. <b>Kernel mode</b> is the manager's uniform "
        "with the master key - the OS may touch anything. <b>User mode</b> is the visitor badge - "
        "apps get a fenced play area and nothing else."))
    story.append(body(
        "Why bother? Because apps will crash, freeze and misbehave - and when a visitor trips, the "
        "whole building must NOT fall over. In user mode, a broken app just... quietly fails, while "
        "the boss stays safe and sound."))
    story.append(RoundedBox(
        "The road ahead",
        "To run a program in visitor mode, the book first lets one run in BOSS mode (easiest), then "
        "builds the full gate: special zones (chapter 6), fake addresses (chapter 9), and a proper "
        "switch through the CPU's &ldquo;return from interruption&rdquo; door - the only way to put "
        "on the visitor uniform.",
        LIGHT, ORANGE, width=W))

    # ===== CH 9 =====
    story.append(PageBreak())
    story.append(ChapterTitle(9, "Fake addresses: paging &amp; virtual memory", GOLD, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(Picture(os.path.join(A, "paging.jpg"),
                         "Every tenant thinks the whole building is theirs - the manager knows better.",
                         width=11 * cm))
    story.append(body(
        "Here is the big magic trick of modern computers. Every program is told: &ldquo;The whole "
        "address space is yours - lockers 0 to 4 billion!&rdquo; Obviously there is not that much "
        "real memory. It is a polite lie."))
    story.append(body(
        "The trick is called <b>paging</b>. Memory is chopped into equal <b>pages</b> - boxes of "
        "4,096 bytes each. A big <b>catalog</b> (the page table) translates every fake address the "
        "program uses into the real box where the data actually lives. A tiny hardware clerk inside "
        "the CPU (the MMU) does this translation billions of times per second."))
    story.append(PagingDiagram())
    story.append(RoundedBox(
        "Why fake addresses are wonderful",
        "1) Each app gets its own privacy fence - it cannot peek at others. 2) Memory can be "
        "scattered anywhere, yet the app still sees a nice tidy hallway. 3) The boss can mark pages "
        "&ldquo;read-only&rdquo; or &ldquo;employees only&rdquo;. 4) Apps can think they own more "
        "memory than the machine even HAS.",
        LIGHT, GOLD, width=W))

    # ===== CH 10 =====
    story.append(PageBreak())
    story.append(ChapterTitle(10, "The landlord: handing out memory rooms", TEAL, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "With fake addresses flowing, somebody must track the REAL boxes: which are free, which are "
        "taken, and which hold the elevator machinery and must never be rented out. That somebody is "
        "the <b>page frame allocator</b> - the landlord of memory."))
    story.append(body(
        "Good news: GRUB already snooped the machine at startup and hands your OS a map of the "
        "building - which floors exist, which are RAM, which are special equipment. The book's "
        "advice: use a simple <b>checklist</b> (one checkbox per box - a &ldquo;bitmap&rdquo;) and "
        "remember to paint the kernel's own rooms as TAKEN. (GRUB does NOT do that for you. Oops.)"))
    story.append(RoundedBox(
        "And the supply closet: a heap",
        "With a landlord in place, the OS can have its own &ldquo;supply closet&rdquo; (a kernel "
        "HEAP): whenever it needs a desk, a list or a name tag, it asks the closet (malloc / free in "
        "the book). The closet asks the landlord for more rooms whenever it runs out.",
        PINKBG, TEAL, width=W))
    story.append(Spacer(1, 0.3 * cm))
    story.append(body(
        "One clever plumbing trick from the book: what if the OS needs a new catalog page to map a "
        "box, but mapping THAT needs a catalog page...? The fix: keep one &ldquo;emergency "
        "window&rdquo; slot permanently free, used only to peek at a fresh box long enough to file "
        "its paperwork. Every OS has a trick like this up its sleeve."))

    # ===== CH 11 =====
    story.append(PageBreak())
    story.append(ChapterTitle(11, "Unpacking a program", ORANGE, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(LoadDiagram())
    story.append(Spacer(1, 0.35 * cm))
    story.append(body(
        "How does an app get onto the stage? A real OS reads programs off disks using drivers and "
        "file systems - lots of work. The book takes a shortcut: GRUB can already carry "
        "&ldquo;packages&rdquo; (called <b>modules</b>) into memory before the OS starts. The OS "
        "just finds the package address and hops to it."))
    story.append(body(
        "The first test program is hilariously small: it writes <b>0xDEADBEEF</b> into a register "
        "and loops forever (another classic programmer joke). Run it, stop the simulator, check the "
        "log: BEEF found? Then a real, separate program ran inside your OS!"))
    story.append(RoundedBox(
        "Real apps, later",
        "Later, real apps are written in C but packed into a &ldquo;flat&rdquo; shape starting with "
        "a tiny 3-step &ldquo;welcome mat&rdquo; at the very front: call main, get the result, loop "
        "forever. A tiny linker script orders the pieces (the full how-to is in the book's chapter "
        "11).",
        LIGHT, ORANGE, width=W))

    # ===== CH 12 =====
    story.append(PageBreak())
    story.append(ChapterTitle(12, "Filing cabinets: file systems", GOLD, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(Picture(os.path.join(A, "files.jpg"),
                         "A file system is the cabinet, the labels, and the librarian rules.",
                         width=11 * cm))
    story.append(body(
        "Why do computers need file systems? Ask: which program starts first? Where do settings "
        "live? How does an app find its data? In the Unix world, the answer to nearly everything is: "
        "&ldquo;it is a file&rdquo;. The file system is the <b>filing cabinet</b> that makes that "
        "possible."))
    story.append(body(
        "<b>Level 1 (simple):</b> one read-only envelope in memory. A little build-time tool stamps "
        "each file with a header (name, size, type) and packs them in a row. The kernel reads them "
        "like a roll of tickets."))
    story.append(body(
        "<b>Level 2 (real):</b> when you need to WRITE files, you meet the <b>inode</b> - a library "
        "card for each file saying where its pages live. This is how Linux and friends work under "
        "the hood."))
    story.append(RoundedBox(
        "The librarian: a Virtual File System (VFS)",
        "Should the keyboard and screen be files too? A VFS is one friendly librarian that presents "
        "EVERYTHING as folders and files, then quietly hands each &ldquo;open, read, write&rdquo; to "
        "the right drawer. That is why, on Linux, even your speakers live under /dev!",
        LIGHT, GOLD, width=W))

    # ===== CH 13 =====
    story.append(PageBreak())
    story.append(ChapterTitle(13, "Ringing the service bell: system calls", TEAL, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(Picture(os.path.join(A, "syscalls.jpg"),
                         "Apps never walk into the manager's office - they press the service bell.",
                         width=11 * cm))
    story.append(body(
        "Visitor-badge apps cannot touch hardware or memory directly. So how do they save a file or "
        "print to the screen? They press a <b>service bell</b>: a <b>system call</b>. It is the one "
        "official way for an app to ask the boss for something."))
    story.append(body(
        "Under the hood, the app fills out a tiny request form (a few numbers saying what it wants), "
        "then rings a special doorbell built with a software interrupt. Linux's famous doorbell is "
        "number 0x80. The CPU instantly switches into boss uniform, does the job, and hands back the "
        "answer - all faster than you can blink."))
    story.append(RoundedBox(
        "The reception desk (TSS)",
        "When a visitor rings, the CPU must know WHICH desk to switch to. It consults a tiny "
        "structure called the TSS - the reception desk address book - that says: &ldquo;the boss's "
        "desk is over there&rdquo;. The book sets this up right before entering user mode. Also: the "
        "doorbell must be marked &ldquo;visitors may ring&rdquo;, or the CPU will refuse the ring!",
        PINKBG, TEAL, width=W))

    # ===== CH 14 =====
    story.append(PageBreak())
    story.append(ChapterTitle(14, "Doing everything at once: multitasking", ORANGE, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "Your music plays, your download runs, your text editor waits - all &ldquo;at the same "
        "time&rdquo;. But the CPU juggles only ONE thing at any instant. The trick is switching so "
        "fast that it LOOKS simultaneous - like a chef flipping between three pans."))
    story.append(TimelineDiagram())
    story.append(Spacer(1, 0.3 * cm))
    story.append(body(
        "There are two ways to switch. <b>Polite way (cooperative):</b> each app, when it can spare "
        "a moment, says &ldquo;your turn!&rdquo; (a yield system call). Simple and easy to debug - "
        "but one rude app can hog everything. <b>Fair way (preemptive):</b> a tiny oven timer (the "
        "PIT) rings every ~20 milliseconds and the boss FORCES a switch. Everyone gets a fair slice "
        "of time."))
    story.append(body(
        "Switching is like pausing a video game: <b>every single detail</b> must be saved - all the "
        "registers, the exact instruction spot, the whole uniform state - so the next turn resumes "
        "mid-thought as if nothing happened. Each process also gets its OWN notepad (its own stack), "
        "so nobody scribbles on anyone else's work."))
    story.append(RoundedBox(
        "Pro tip from the book",
        "Build the polite version FIRST. Because it is deterministic (always the same steps in the "
        "same order), bugs are far easier to catch. Only then add the oven timer. Slow and steady "
        "wins the race - the authors built their whole OS in six weeks exactly this way!",
        LIGHT, ORANGE, width=W))

    # ===== CH 15 =====
    story.append(PageBreak())
    story.append(ChapterTitle(15, "You made it! The whole journey", GOLD, width=W))
    story.append(Spacer(1, 0.45 * cm))
    story.append(body(
        "That is the entire book - from a dead piece of metal to a little world that can run "
        "programs, show text, listen to the keyboard and juggle tasks. Let us re-tell the whole "
        "story in one breath:"))
    story.append(RoundedBox(
        "The journey in one breath",
        "A computer wakes up (BIOS), hands over to a delivery driver (GRUB), who starts YOUR boss "
        "program after checking the secret handshake (0xCAFEBABE). The boss paints the light-board "
        "screen, opens a diary line, draws zones and permissions on the warehouse floor (segmentation), "
        "installs doorbells (interrupts), invents fake addresses (paging), rents out memory rooms "
        "(the allocator), unpacks programs, files paperwork (file systems), opens a service counter "
        "(system calls) and learns to juggle (multitasking).",
        CREAM, GOLD, width=W))
    story.append(Spacer(1, 0.4 * cm))
    story.append(body(
        "The real book says something wise: build in <b>tiny steps</b>, and after every step, TEST "
        "it. That habit - more than any single line of code - is how six weeks of steady work turns "
        "an empty machine into a working operating system."))
    story.append(body(
        "And if you ever get stuck? The authors point to the friendly OSDev wiki community, the "
        "book's own issue tracker on GitHub, and - above all - patience. Every expert was once "
        "exactly where you are now."))
    story.append(Spacer(1, 0.6 * cm))
    story.append(RoundedBox(
        "The end... and the beginning",
        "Now you know what every computer does the instant you press its power button - and roughly "
        "how people build one from scratch. If reading this made you curious about coding, that is "
        "the perfect sign. The next tiny step is yours to pick!",
        LIGHT, TEAL, width=W))

    import part23
    part23.add_parts(story, W)

    doc.build(story)
    print("Wrote", OUT)

if __name__ == "__main__":
    build()
