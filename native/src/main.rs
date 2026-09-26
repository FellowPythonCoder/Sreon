#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use eframe::{egui, App, Frame, NativeOptions};
use egui::{Align, Color32, FontId, Layout, RichText, Sense, Stroke, Vec2};
use raw_window_handle::HasWindowHandle;
#[cfg(target_os = "linux")]
use raw_window_handle::RawWindowHandle;
use std::time::{Duration, Instant};
use wry::{dpi::{LogicalPosition, LogicalSize}, Rect, WebView, WebViewBuilder};

const BG: Color32 = Color32::from_rgb(23, 19, 30);
const SIDEBAR: Color32 = Color32::from_rgb(29, 24, 39);
const PANEL: Color32 = Color32::from_rgb(34, 28, 45);
const PANEL_RAISED: Color32 = Color32::from_rgb(44, 35, 57);
const CREAM: Color32 = Color32::from_rgb(251, 247, 237);
const INK: Color32 = Color32::from_rgb(42, 34, 53);
const MUTED: Color32 = Color32::from_rgb(153, 143, 163);
const DIM: Color32 = Color32::from_rgb(109, 99, 119);
const PURPLE: Color32 = Color32::from_rgb(174, 148, 247);
const GREEN: Color32 = Color32::from_rgb(138, 199, 181);
const LINE: Color32 = Color32::from_rgba_premultiplied(255, 255, 255, 22);

#[derive(Clone, Copy, PartialEq, Eq)]
enum View {
    Home,
    Tabs,
    Bookmarks,
    History,
    Downloads,
    Privacy,
    Settings,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum SidebarMode {
    Expanded,
    Compact,
    Floating,
    AutoHide,
    Pinned,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Theme {
    Dark,
    Light,
}

struct Tab {
    title: String,
    url: String,
    domain: String,
    pinned: bool,
    muted: bool,
    audio: bool,
}

struct Bookmark {
    title: String,
    url: String,
    domain: String,
}

struct HistoryItem {
    title: String,
    url: String,
    time: String,
}

struct SreonApp {
    view: View,
    sidebar_mode: SidebarMode,
    sidebar_width: f32,
    sidebar_opacity: f32,
    theme: Theme,
    accent: Color32,
    shield: bool,
    query: String,
    address: String,
    tabs: Vec<Tab>,
    active_tab: usize,
    bookmarks: Vec<Bookmark>,
    history: Vec<HistoryItem>,
    command_open: bool,
    customize_open: bool,
    focus_search: bool,
    webview: Option<WebView>,
    webview_open: bool,
    toast: Option<(String, Instant)>,
}

impl Default for SreonApp {
    fn default() -> Self {
        Self {
            view: View::Home,
            sidebar_mode: SidebarMode::Expanded,
            sidebar_width: 258.0,
            sidebar_opacity: 94.0,
            theme: Theme::Dark,
            accent: PURPLE,
            shield: true,
            query: String::new(),
            address: String::new(),
            tabs: vec![
                Tab {
                    title: "New tab".into(),
                    url: "sreon://home".into(),
                    domain: "Sreon".into(),
                    pinned: true,
                    muted: false,
                    audio: false,
                },
                Tab {
                    title: "A little more room to explore".into(),
                    url: "https://opensreon.com".into(),
                    domain: "opensreon.com".into(),
                    pinned: false,
                    muted: false,
                    audio: false,
                },
                Tab {
                    title: "GitHub".into(),
                    url: "https://github.com".into(),
                    domain: "github.com".into(),
                    pinned: false,
                    muted: false,
                    audio: false,
                },
            ],
            active_tab: 0,
            bookmarks: vec![
                Bookmark { title: "Sreon".into(), url: "https://opensreon.com".into(), domain: "opensreon.com".into() },
                Bookmark { title: "GitHub".into(), url: "https://github.com".into(), domain: "github.com".into() },
            ],
            history: vec![
                HistoryItem { title: "Sreon — a little more room to explore".into(), url: "https://opensreon.com".into(), time: "Today, 10:42".into() },
                HistoryItem { title: "GitHub".into(), url: "https://github.com".into(), time: "Yesterday, 18:20".into() },
            ],
            command_open: false,
            customize_open: false,
            focus_search: false,
            webview: None,
            webview_open: false,
            toast: None,
        }
    }
}

impl SreonApp {
    fn new(cc: &eframe::CreationContext<'_>) -> Self {
        let mut app = Self::default();
        app.apply_theme(&cc.egui_ctx);
        #[cfg(target_os = "linux")]
        let _ = gtk::init();
        if let Ok(handle) = cc.window_handle() {
            #[cfg(target_os = "linux")]
            let supports_child_webview = matches!(handle.as_raw(), RawWindowHandle::Xlib(_) | RawWindowHandle::Xcb(_));
            #[cfg(not(target_os = "linux"))]
            let supports_child_webview = true;
            if supports_child_webview {
                app.webview = WebViewBuilder::new()
                    .with_initialization_script(SREON_WEBVIEW_SCRIPT)
                    .with_visible(false)
                    .with_url("about:blank")
                    .build_as_child(&handle)
                    .ok();
                if let Some(webview) = &app.webview {
                    let _ = webview.set_visible(false);
                }
            }
        }
        app
    }

    fn apply_theme(&self, ctx: &egui::Context) {
        let mut visuals = match self.theme {
            Theme::Dark => egui::Visuals::dark(),
            Theme::Light => egui::Visuals::light(),
        };
        visuals.window_fill = match self.theme { Theme::Dark => BG, Theme::Light => Color32::from_rgb(244, 240, 233) };
        visuals.panel_fill = match self.theme { Theme::Dark => PANEL, Theme::Light => Color32::from_rgb(251, 249, 244) };
        visuals.faint_bg_color = match self.theme { Theme::Dark => PANEL_RAISED, Theme::Light => Color32::from_rgb(239, 235, 227) };
        visuals.extreme_bg_color = match self.theme { Theme::Dark => Color32::from_rgb(16, 13, 21), Theme::Light => Color32::from_rgb(232, 227, 218) };
        visuals.widgets.noninteractive.bg_stroke = Stroke::new(1.0_f32, LINE);
        visuals.widgets.noninteractive.rounding = egui::Rounding::same(9.0);
        visuals.widgets.inactive.bg_fill = Color32::TRANSPARENT;
        visuals.widgets.inactive.rounding = egui::Rounding::same(9.0);
        visuals.widgets.hovered.bg_fill = PANEL_RAISED;
        visuals.widgets.hovered.rounding = egui::Rounding::same(9.0);
        visuals.widgets.active.bg_fill = self.accent;
        visuals.widgets.active.rounding = egui::Rounding::same(9.0);
        visuals.widgets.open.bg_fill = PANEL_RAISED;
        visuals.widgets.open.rounding = egui::Rounding::same(9.0);
        visuals.selection.bg_fill = self.accent;
        visuals.selection.stroke = Stroke::new(1.0_f32, self.accent);
        let mut style = (*ctx.style()).clone();
        style.spacing.item_spacing = Vec2::new(8.0, 8.0);
        style.spacing.button_padding = Vec2::new(10.0, 7.0);
        style.spacing.window_margin = egui::Margin::same(16.0);
        style.visuals = visuals;
        ctx.set_style(style);
    }

    fn is_compact(&self) -> bool { self.sidebar_mode == SidebarMode::Compact }

    fn notify(&mut self, message: impl Into<String>) {
        self.toast = Some((message.into(), Instant::now()));
    }

    fn current_tab(&self) -> &Tab { &self.tabs[self.active_tab] }

    fn hide_webview(&mut self) {
        self.webview_open = false;
        if let Some(webview) = &self.webview {
            let _ = webview.set_visible(false);
        }
    }

    fn open_internal(&mut self, url: &str) {
        let result = self.webview.as_ref().map(|webview| webview.load_url(url));
        match result {
            Some(Ok(())) => {
                self.webview_open = true;
                if let Some(webview) = &self.webview { let _ = webview.set_visible(true); }
            }
            Some(Err(error)) => self.notify(format!("Sreon could not load this page: {error}")),
            None => self.notify("The native web view is unavailable"),
        }
    }

    fn open_link(&mut self, url: &str, title: Option<&str>) {
        let url = if url.starts_with("http://") || url.starts_with("https://") { url.to_owned() } else { format!("https://{url}") };
        self.open_internal(&url);
        if let Some(tab) = self.tabs.get_mut(self.active_tab) {
            tab.url = url.clone();
            tab.domain = url.trim_start_matches("https://").trim_start_matches("http://").split('/').next().unwrap_or("web").replace("www.", "");
            tab.title = title.unwrap_or(&tab.domain).to_owned();
        }
        self.address = url;
        self.view = View::Home;
        self.notify("Opened in your browser");
    }

    fn search(&mut self, query: &str) {
        let query = query.trim();
        if query.is_empty() { return; }
        self.query = query.to_owned();
        let url = format!("https://www.bing.com/search?q={}&form=SRON01", urlencoding::encode(query));
        self.open_internal(&url);
        self.notify("Sreon Search opened");
    }

    fn new_tab(&mut self) {
        self.tabs.push(Tab { title: "New tab".into(), url: "sreon://home".into(), domain: "Sreon".into(), pinned: false, muted: false, audio: false });
        self.active_tab = self.tabs.len() - 1;
        self.view = View::Home;
        self.hide_webview();
    }

    fn close_tab(&mut self, index: usize) {
        if self.tabs.len() == 1 { return; }
        self.tabs.remove(index);
        if self.active_tab >= self.tabs.len() { self.active_tab = self.tabs.len() - 1; }
        if index < self.active_tab { self.active_tab -= 1; }
    }

    fn draw_logo(&self, ui: &mut egui::Ui, size: f32) {
        let (rect, _) = ui.allocate_exact_size(Vec2::splat(size), Sense::hover());
        let painter = ui.painter();
        painter.rect_filled(rect, egui::Rounding::same(size * 0.28), self.accent);
        painter.circle_filled(rect.left_top() + Vec2::new(size * 0.76, size * 0.22), size * 0.045, CREAM);
        let left = rect.left() + size * 0.27;
        let right = rect.right() - size * 0.21;
        let top = rect.top() + size * 0.25;
        let mid = rect.center().y;
        let bottom = rect.bottom() - size * 0.23;
        let stroke = Stroke::new(size * 0.095, INK);
        painter.line_segment([egui::pos2(right, top), egui::pos2(left + size * 0.19, top)], stroke);
        painter.line_segment([egui::pos2(left + size * 0.19, top), egui::pos2(left, mid - size * 0.06)], stroke);
        painter.line_segment([egui::pos2(left, mid - size * 0.06), egui::pos2(right - size * 0.09, mid + size * 0.07)], stroke);
        painter.line_segment([egui::pos2(right - size * 0.09, mid + size * 0.07), egui::pos2(right - size * 0.17, bottom)], stroke);
        painter.line_segment([egui::pos2(right - size * 0.17, bottom), egui::pos2(left, bottom)], stroke);
    }

    fn nav_button(&mut self, ui: &mut egui::Ui, glyph: &str, label: &str, view: View) {
        let active = self.view == view;
        let compact = self.is_compact();
        let text = if compact { glyph.to_owned() } else { format!("{glyph}   {label}") };
        let mut button = egui::Button::new(RichText::new(text).size(if compact { 19.0 } else { 13.0 }));
        button = button.fill(if active { PANEL_RAISED } else { Color32::TRANSPARENT });
        let response = ui.add_sized([ui.available_width(), 34.0], button);
        if response.clicked() { self.view = view; self.command_open = false; self.hide_webview(); }
        if compact { response.on_hover_text(label); }
    }

    fn sidebar(&mut self, ctx: &egui::Context) {
        let width = if self.is_compact() { 72.0 } else { self.sidebar_width };
        egui::SidePanel::left("sreon_sidebar").exact_width(width).resizable(false).frame(egui::Frame::none().fill(SIDEBAR).inner_margin(egui::Margin::same(14.0))).show(ctx, |ui| {
            ui.horizontal(|ui| {
                self.draw_logo(ui, 34.0);
                if !self.is_compact() {
                    ui.add_space(9.0);
                    ui.vertical(|ui| {
                        ui.label(RichText::new("sreon").size(16.0).strong());
                        ui.label(RichText::new("quiet browser").size(10.0).color(DIM).family(egui::FontFamily::Monospace));
                    });
                }
            });
            ui.add_space(19.0);
            let new_text = if self.is_compact() { "＋" } else { "＋   New tab" };
            if ui.add_sized([ui.available_width(), 36.0], egui::Button::new(RichText::new(new_text).size(if self.is_compact() { 20.0 } else { 12.0 })).fill(CREAM)).clicked() { self.new_tab(); }
            ui.add_space(12.0);
            if !self.is_compact() { ui.label(RichText::new("LIBRARY").size(10.0).color(DIM).family(egui::FontFamily::Monospace)); ui.add_space(4.0); }
            self.nav_button(ui, "⌂", "Home", View::Home);
            self.nav_button(ui, "◫", "Tabs", View::Tabs);
            self.nav_button(ui, "☆", "Bookmarks", View::Bookmarks);
            self.nav_button(ui, "◷", "History", View::History);
            self.nav_button(ui, "↓", "Downloads", View::Downloads);
            ui.add_space(12.0);
            self.nav_button(ui, "◒", "Privacy", View::Privacy);
            self.nav_button(ui, "⚙", "Settings", View::Settings);
            ui.add_space(13.0);
            ui.separator();
            ui.add_space(10.0);
            if !self.is_compact() { ui.label(RichText::new("OPEN TABS").size(10.0).color(DIM).family(egui::FontFamily::Monospace)); ui.add_space(4.0); }
            let mut select = None;
            let mut close = None;
            let compact = self.is_compact();
            let active_index = self.active_tab;
            let accent = self.accent;
            egui::ScrollArea::vertical().id_source("sidebar_tabs").max_height(250.0).show(ui, |ui| {
                for (index, tab) in self.tabs.iter().enumerate() {
                    let active = index == active_index;
                    let title = tab.title.clone();
                    let text = if compact { "●".to_owned() } else { format!("{}  {}", if active { "●" } else { "○" }, title) };
                    let response = ui.add_sized([ui.available_width(), 34.0], egui::Button::new(RichText::new(text).size(11.0).color(if active { accent } else { MUTED })).fill(if active { PANEL_RAISED } else { Color32::TRANSPARENT }));
                    if response.clicked() { select = Some(index); }
                    if response.secondary_clicked() { close = Some(index); }
                    if compact { response.on_hover_text(title); }
                }
            });
            if let Some(index) = select { self.active_tab = index; self.view = View::Home; }
            if let Some(index) = close { self.close_tab(index); }
            ui.with_layout(Layout::bottom_up(Align::LEFT), |ui| {
                ui.separator();
                ui.add_space(8.0);
                if !self.is_compact() {
                    let shield_text = if self.shield { "◒  Privacy shield  ON" } else { "◒  Shield paused" };
                    if ui.add_sized([ui.available_width(), 32.0], egui::Button::new(RichText::new(shield_text).size(10.0).color(if self.shield { GREEN } else { MUTED })).fill(Color32::from_rgba_premultiplied(138, 199, 181, 18))).clicked() { self.view = View::Privacy; }
                } else if ui.button(RichText::new("◒").size(18.0).color(if self.shield { GREEN } else { MUTED })).on_hover_text("Privacy").clicked() { self.view = View::Privacy; }
                ui.add_space(6.0);
                let customize = if self.is_compact() { "⋯" } else { "⌘ K   Quick command" };
                if ui.add_sized([ui.available_width(), 30.0], egui::Button::new(RichText::new(customize).size(11.0)).fill(Color32::TRANSPARENT)).clicked() { self.command_open = true; }
            });
        });
    }

    fn sync_webview(&self, ctx: &egui::Context) {
        let Some(webview) = &self.webview else { return; };
        let visible = self.webview_open && !self.customize_open;
        let screen = ctx.screen_rect();
        let sidebar = if self.is_compact() { 72.0 } else { self.sidebar_width };
        let top = 72.0;
        let bottom = 30.0;
        let left = sidebar + 1.0;
        let width = (screen.width() - left - 1.0).max(1.0);
        let height = (screen.height() - top - bottom).max(1.0);
        let bounds = Rect {
            position: LogicalPosition::new(left as f64, top as f64).into(),
            size: LogicalSize::new(width as f64, height as f64).into(),
        };
        let _ = webview.set_bounds(bounds);
        let _ = webview.set_visible(visible);
    }

    fn paint_shell(&self, ui: &mut egui::Ui) {
        let rect = ui.max_rect();
        let painter = ui.painter();
        let shell_bg = if self.theme == Theme::Dark { BG } else { Color32::from_rgb(244, 240, 233) };
        painter.rect_filled(rect, 0.0, shell_bg);
        let glow = if self.theme == Theme::Dark {
            Color32::from_rgba_premultiplied(self.accent.r(), self.accent.g(), self.accent.b(), 18)
        } else {
            Color32::from_rgba_premultiplied(135, 103, 218, 14)
        };
        painter.circle_filled(rect.right_top() + Vec2::new(-90.0, 155.0), 190.0, glow);
        painter.circle_stroke(rect.right_top() + Vec2::new(-115.0, 140.0), 190.0, Stroke::new(1.0_f32, Color32::from_rgba_premultiplied(255, 255, 255, 14)));
        painter.line_segment([rect.left_top() + Vec2::new(0.0, 71.0), rect.right_top() + Vec2::new(0.0, 71.0)], Stroke::new(1.0_f32, LINE));
    }

    fn chrome(&mut self, ui: &mut egui::Ui) {
        ui.horizontal(|ui| {
            for symbol in ["‹", "›", "↻"] { ui.add_sized([28.0, 28.0], egui::Button::new(RichText::new(symbol).size(17.0)).fill(Color32::TRANSPARENT)); }
            ui.add_space(7.0);
            let width = (ui.available_width() - 45.0).max(200.0);
            egui::Frame::none().fill(PANEL).stroke(Stroke::new(1.0_f32, LINE)).rounding(egui::Rounding::same(10.0)).inner_margin(egui::Margin::symmetric(9.0, 2.0)).show(ui, |ui| {
                ui.set_min_width(width);
                ui.with_layout(Layout::left_to_right(Align::Center), |ui| {
                    ui.label(RichText::new(if self.shield { "◒" } else { "○" }).color(if self.shield { GREEN } else { DIM }));
                    let response = ui.add_sized([ui.available_width() - 46.0, 30.0], egui::TextEdit::singleline(&mut self.address).hint_text("Search the web or enter an address").font(FontId::monospace(11.0)));
                    if response.lost_focus() && ui.input(|input| input.key_pressed(egui::Key::Enter)) {
                        let value = self.address.clone();
                        if value.starts_with("http://") || value.starts_with("https://") { self.open_link(&value, None); } else { self.search(&value); }
                    }
                    if ui.button(RichText::new("☆").size(17.0).color(DIM)).clicked() { self.notify("Save from the browser window"); }
                });
            });
            ui.add_space(8.0);
            if self.webview_open && ui.button(RichText::new("×").size(18.0).color(MUTED)).on_hover_text("Close web view").clicked() { self.hide_webview(); }
            if ui.button(RichText::new(if self.shield { "Protected" } else { "Open" }).size(10.0).color(if self.shield { GREEN } else { MUTED })).clicked() { self.view = View::Privacy; self.hide_webview(); }
            if ui.button(RichText::new("☷").size(17.0)).on_hover_text("Customize sidebar").clicked() { self.customize_open = true; }
        });
    }

    fn home(&mut self, ui: &mut egui::Ui) {
        let available = ui.available_width();
        ui.add_space(38.0);
        ui.horizontal(|ui| {
            ui.vertical(|ui| {
                ui.label(RichText::new("SREON  /  A QUIETER WEB").size(10.0).color(self.accent).family(egui::FontFamily::Monospace));
                ui.add_space(20.0);
                ui.label(RichText::new("Make room\nfor curiosity.").size((available * 0.055).clamp(38.0, 61.0)).color(if self.theme == Theme::Dark { CREAM } else { INK }).strong());
                ui.add_space(13.0);
                ui.label(RichText::new("Search, read, and move through the web without\na browser getting in the way.").size(13.0).color(MUTED));
                ui.add_space(23.0);
                ui.horizontal(|ui| {
                    let width = (available * 0.62).clamp(290.0, 520.0);
                    ui.add_sized([width, 43.0], egui::TextEdit::singleline(&mut self.query).hint_text("What are you curious about?").font(FontId::proportional(13.0)));
                    if ui.add_sized([96.0, 43.0], egui::Button::new("Explore  ↗").fill(self.accent)).clicked() { let query = self.query.clone(); self.search(&query); }
                });
                ui.add_space(9.0);
                ui.horizontal(|ui| {
                    for suggestion in ["quiet places", "Sreon browser", "inspiration for today"] { if ui.link(RichText::new(suggestion).size(10.0).color(MUTED)).clicked() { self.search(suggestion); } ui.add_space(7.0); }
                });
            });
            ui.with_layout(Layout::right_to_left(Align::Center), |ui| { self.draw_landscape(ui, (available * 0.32).clamp(230.0, 370.0)); });
        });
        ui.add_space(42.0);
        ui.separator();
        ui.add_space(22.0);
        ui.horizontal_wrapped(|ui| {
            self.info_card(ui, "01  PRIVATE BY DEFAULT", "Tracker blocking stays on for this window.", "Open privacy", View::Privacy);
            self.info_card(ui, "02  YOUR OPEN SPACE", &format!("{} tabs, kept close and quiet.", self.tabs.len()), "See tabs", View::Tabs);
            self.info_card(ui, "03  SMALL DETOURS", "⌘ K for commands. / to search.", "Customize", View::Settings);
        });
        ui.add_space(22.0);
        ui.horizontal(|ui| { ui.label(RichText::new("●  Built for focus   ·   No account needed   ·   Open by nature").size(10.0).color(DIM).family(egui::FontFamily::Monospace)); });
    }

    fn draw_landscape(&self, ui: &mut egui::Ui, width: f32) {
        let (rect, _) = ui.allocate_exact_size(Vec2::new(width, 246.0), Sense::hover());
        let painter = ui.painter();
        painter.rect_filled(rect, egui::Rounding::same(18.0), Color32::from_rgb(106, 79, 159));
        painter.circle_filled(rect.left_top() + Vec2::new(width * 0.54, 72.0), 53.0, Color32::from_rgb(255, 245, 211));
        painter.circle_stroke(rect.left_top() + Vec2::new(width * 0.54, 72.0), 76.0, Stroke::new(1.0_f32, Color32::from_rgba_premultiplied(255, 248, 225, 90)));
        let base = rect.bottom();
        let back = vec![rect.left_bottom(), rect.left_top() + Vec2::new(width * 0.22, 100.0), rect.left_top() + Vec2::new(width * 0.47, 141.0), rect.left_top() + Vec2::new(width * 0.71, 94.0), rect.right_bottom()];
        painter.add(egui::Shape::convex_polygon(back, Color32::from_rgb(136, 110, 193), Stroke::NONE));
        let front = vec![rect.left_top() + Vec2::new(width * 0.25, 195.0), rect.left_top() + Vec2::new(width * 0.57, 76.0), rect.left_top() + Vec2::new(width * 0.93, 213.0), rect.right_bottom(), rect.left_bottom()];
        painter.add(egui::Shape::convex_polygon(front, Color32::from_rgb(76, 55, 122), Stroke::NONE));
        painter.text(rect.right_bottom() - Vec2::new(16.0, 18.0), egui::Align2::RIGHT_BOTTOM, "A LITTLE MORE ROOM", FontId::monospace(9.0), Color32::from_rgba_premultiplied(255, 247, 224, 180));
        let _ = base;
    }

    fn info_card(&mut self, ui: &mut egui::Ui, label: &str, copy: &str, action: &str, view: View) {
        let width = ((ui.available_width() - 24.0) / 3.0).max(180.0);
        egui::Frame::none().fill(PANEL).stroke(Stroke::new(1.0_f32, LINE)).rounding(egui::Rounding::same(12.0)).inner_margin(egui::Margin::same(16.0)).show(ui, |ui| {
            ui.set_min_size(Vec2::new(width, 125.0));
            ui.label(RichText::new(label).size(9.0).color(DIM).family(egui::FontFamily::Monospace));
            ui.add_space(18.0);
            ui.label(RichText::new(copy).size(12.0).color(MUTED));
            ui.add_space(12.0);
            if ui.link(RichText::new(format!("{action}  →")).size(10.0).color(self.accent)).clicked() { self.view = view; }
        });
    }

    fn list_page(&mut self, ui: &mut egui::Ui, title: &str, copy: &str) {
        ui.add_space(37.0);
        ui.label(RichText::new(title.to_uppercase()).size(10.0).color(self.accent).family(egui::FontFamily::Monospace));
        ui.add_space(11.0);
        ui.label(RichText::new(title).size(38.0).strong());
        ui.add_space(8.0);
        ui.label(RichText::new(copy).size(13.0).color(MUTED));
        ui.add_space(30.0);
    }

    fn tabs_page(&mut self, ui: &mut egui::Ui) {
        self.list_page(ui, "Open tabs.", "Everything you have open, in one quiet place.");
        if ui.button(RichText::new("＋  New tab").size(11.0).color(INK)).clicked() { self.new_tab(); }
        ui.add_space(15.0);
        for index in 0..self.tabs.len() {
            let active = index == self.active_tab;
            let title = self.tabs[index].title.clone();
            let url = self.tabs[index].url.clone();
            let muted = self.tabs[index].muted;
            let pinned = self.tabs[index].pinned;
            egui::Frame::none().fill(if active { PANEL_RAISED } else { PANEL }).stroke(Stroke::new(1.0_f32, LINE)).rounding(egui::Rounding::same(9.0)).inner_margin(egui::Margin::symmetric(14.0, 12.0)).show(ui, |ui| {
                ui.horizontal(|ui| {
                    ui.label(RichText::new(format!("{:02}", index + 1)).size(10.0).color(DIM).family(egui::FontFamily::Monospace));
                    ui.vertical(|ui| { ui.label(RichText::new(&title).size(12.0).strong()); ui.label(RichText::new(&url).size(10.0).color(MUTED).family(egui::FontFamily::Monospace)); });
                    ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                        if ui.small_button("×").clicked() { self.close_tab(index); }
                        if ui.small_button(if muted { "◌" } else { "◉" }).clicked() { if let Some(tab) = self.tabs.get_mut(index) { tab.muted = !tab.muted; tab.audio = true; } }
                        if ui.small_button(if pinned { "◆" } else { "◇" }).clicked() { if let Some(tab) = self.tabs.get_mut(index) { tab.pinned = !tab.pinned; } }
                        if ui.small_button("→").clicked() { self.active_tab = index; self.view = View::Home; }
                    });
                });
            });
            ui.add_space(7.0);
        }
    }

    fn bookmarks_page(&mut self, ui: &mut egui::Ui) {
        self.list_page(ui, "Bookmarks.", "The things worth finding again.");
        for index in 0..self.bookmarks.len() {
            let url = self.bookmarks[index].url.clone(); let title = self.bookmarks[index].title.clone(); let domain = self.bookmarks[index].domain.clone();
            egui::Frame::none().fill(PANEL).stroke(Stroke::new(1.0_f32, LINE)).rounding(egui::Rounding::same(9.0)).inner_margin(egui::Margin::same(15.0)).show(ui, |ui| {
                ui.horizontal(|ui| { ui.label(RichText::new("◇").size(19.0).color(self.accent)); ui.vertical(|ui| { ui.label(RichText::new(title).size(12.0).strong()); ui.label(RichText::new(domain).size(10.0).color(MUTED).family(egui::FontFamily::Monospace)); }); ui.with_layout(Layout::right_to_left(Align::Center), |ui| { if ui.link("Open →").clicked() { self.open_link(&url, None); } }); });
            });
            ui.add_space(7.0);
        }
    }

    fn history_page(&mut self, ui: &mut egui::Ui) {
        self.list_page(ui, "History.", "A clear path back to where you started.");
        if ui.button(RichText::new("Clear history").size(11.0).color(MUTED)).clicked() { self.history.clear(); }
        ui.add_space(12.0);
        for index in 0..self.history.len() {
            let url = self.history[index].url.clone(); let title = self.history[index].title.clone(); let time = self.history[index].time.clone();
            ui.horizontal(|ui| { ui.label(RichText::new("◷").size(18.0).color(self.accent)); ui.vertical(|ui| { ui.label(RichText::new(title).size(12.0).strong()); ui.label(RichText::new(&url).size(10.0).color(MUTED).family(egui::FontFamily::Monospace)); }); ui.with_layout(Layout::right_to_left(Align::Center), |ui| { ui.label(RichText::new(time).size(10.0).color(DIM)); if ui.link("Open").clicked() { self.open_link(&url, None); } }); });
            ui.separator();
        }
    }

    fn downloads_page(&mut self, ui: &mut egui::Ui) {
        self.list_page(ui, "Downloads.", "Files from the web, kept close by.");
        egui::Frame::none().fill(PANEL).stroke(Stroke::new(1.0_f32, LINE)).rounding(egui::Rounding::same(10.0)).inner_margin(egui::Margin::same(20.0)).show(ui, |ui| {
            ui.horizontal(|ui| { ui.label(RichText::new("↓").size(25.0).color(self.accent)); ui.vertical(|ui| { ui.label(RichText::new("System downloads").size(13.0).strong()); ui.label(RichText::new("Files stay in your operating system Downloads folder.").size(11.0).color(MUTED)); }); });
            ui.add_space(15.0);
            if ui.button("Open downloads folder").clicked() { open_download_folder(); }
        });
    }

    fn privacy_page(&mut self, ui: &mut egui::Ui) {
        self.list_page(ui, "Privacy, plainly.", "A browser should tell you what it is doing.");
        egui::Frame::none().fill(Color32::from_rgba_premultiplied(138, 199, 181, 20)).stroke(Stroke::new(1.0_f32, Color32::from_rgba_premultiplied(138, 199, 181, 55))).rounding(egui::Rounding::same(12.0)).inner_margin(egui::Margin::same(20.0)).show(ui, |ui| {
            ui.horizontal(|ui| { ui.label(RichText::new("◒").size(29.0).color(GREEN)); ui.vertical(|ui| { ui.label(RichText::new(if self.shield { "Shield active" } else { "Shield paused" }).size(16.0).strong()); ui.label(RichText::new(if self.shield { "Known trackers are blocked for this window." } else { "Protection is paused for this window." }).size(11.0).color(MUTED)); }); ui.with_layout(Layout::right_to_left(Align::Center), |ui| { if ui.button(if self.shield { "Pause shield" } else { "Enable shield" }).clicked() { self.shield = !self.shield; } }); });
        });
        ui.add_space(20.0);
        ui.label(RichText::new("PLAIN LANGUAGE").size(10.0).color(self.accent).family(egui::FontFamily::Monospace));
        ui.add_space(9.0);
        ui.label(RichText::new("Your searches still go to search providers.\nSreon is not a VPN or an anonymity service.\nIt is a quieter, more visible place to begin.").size(13.0).color(MUTED));
    }

    fn settings_page(&mut self, ui: &mut egui::Ui) {
        self.list_page(ui, "Make it yours.", "The important controls, without a maze of settings.");
        egui::Frame::none().fill(PANEL).stroke(Stroke::new(1.0_f32, LINE)).rounding(egui::Rounding::same(12.0)).inner_margin(egui::Margin::same(18.0)).show(ui, |ui| {
            ui.label(RichText::new("SIDEBAR").size(10.0).color(self.accent).family(egui::FontFamily::Monospace));
            ui.add_space(12.0);
            ui.horizontal(|ui| {
                for (mode, label) in [(SidebarMode::Expanded, "Expanded"), (SidebarMode::Compact, "Compact"), (SidebarMode::Floating, "Floating"), (SidebarMode::AutoHide, "Auto-hide"), (SidebarMode::Pinned, "Pinned")] {
                    if ui.selectable_label(self.sidebar_mode == mode, label).clicked() { self.sidebar_mode = mode; }
                }
            });
            ui.add_space(15.0);
            ui.add(egui::Slider::new(&mut self.sidebar_width, 220.0..=340.0).text("width"));
            ui.add(egui::Slider::new(&mut self.sidebar_opacity, 70.0..=100.0).text("opacity"));
            ui.separator();
            ui.add_space(8.0);
            ui.horizontal(|ui| {
                ui.label(RichText::new("Theme").size(11.0));
                if ui.selectable_label(self.theme == Theme::Dark, "Dark").clicked() { self.theme = Theme::Dark; }
                if ui.selectable_label(self.theme == Theme::Light, "Light").clicked() { self.theme = Theme::Light; }
            });
            ui.add_space(12.0);
            ui.horizontal(|ui| {
                ui.label(RichText::new("Accent").size(11.0));
                for color in [PURPLE, Color32::from_rgb(217, 154, 119), Color32::from_rgb(116, 184, 174), Color32::from_rgb(230, 196, 119)] { if ui.add(egui::Button::new("  ").fill(color)).clicked() { self.accent = color; } }
            });
            ui.separator();
            ui.add_space(8.0);
            ui.horizontal(|ui| { ui.label(RichText::new("Privacy shield").size(11.0)); ui.checkbox(&mut self.shield, "Block known trackers"); });
        });
        ui.add_space(18.0);
        ui.label(RichText::new("SHORTCUTS").size(10.0).color(self.accent).family(egui::FontFamily::Monospace));
        ui.add_space(8.0);
        ui.label(RichText::new("⌘ K   command palette     ·     /   search     ·     ⌘ T   new tab").size(11.0).color(MUTED).family(egui::FontFamily::Monospace));
    }

    fn customizer(&mut self, ctx: &egui::Context) {
        egui::SidePanel::right("customize_panel").exact_width(292.0).resizable(false).frame(egui::Frame::none().fill(SIDEBAR).inner_margin(egui::Margin::same(20.0))).show(ctx, |ui| {
            ui.horizontal(|ui| { ui.vertical(|ui| { ui.label(RichText::new("SIDEBAR").size(10.0).color(self.accent).family(egui::FontFamily::Monospace)); ui.label(RichText::new("Make it yours.").size(22.0).strong()); }); if ui.button("×").clicked() { self.customize_open = false; } });
            ui.add_space(10.0);
            ui.label(RichText::new("A small set of controls for the front door of your browser.").size(11.0).color(MUTED));
            ui.add_space(24.0);
            ui.label(RichText::new("MODE").size(10.0).color(DIM).family(egui::FontFamily::Monospace));
            ui.add_space(7.0);
            for (mode, label, desc) in [(SidebarMode::Expanded, "Expanded", "Icon + name"), (SidebarMode::Compact, "Compact", "Icon only"), (SidebarMode::Floating, "Floating", "Over the web"), (SidebarMode::AutoHide, "Auto-hide", "At the edge"), (SidebarMode::Pinned, "Pinned", "Always visible")] {
                if ui.selectable_label(self.sidebar_mode == mode, RichText::new(format!("{label}  ·  {desc}")).size(11.0)).clicked() { self.sidebar_mode = mode; }
            }
            ui.add_space(18.0);
            ui.add(egui::Slider::new(&mut self.sidebar_width, 220.0..=340.0).text("width"));
            ui.add(egui::Slider::new(&mut self.sidebar_opacity, 70.0..=100.0).text("opacity"));
            ui.add_space(18.0);
            if ui.button("Open full settings →").clicked() { self.customize_open = false; self.view = View::Settings; }
        });
    }

    fn command_palette(&mut self, ctx: &egui::Context) {
        egui::Window::new("Quick command").collapsible(false).resizable(false).default_width(470.0).anchor(egui::Align2::CENTER_TOP, [0.0, 115.0]).show(ctx, |ui| {
            ui.label(RichText::new("⌕  Search the web").size(13.0));
            ui.add_space(6.0);
            let response = ui.add(egui::TextEdit::singleline(&mut self.query).hint_text("What do you want to do?").desired_width(f32::INFINITY));
            if self.focus_search { response.request_focus(); self.focus_search = false; }
            ui.separator();
            for (glyph, label) in [("＋", "New tab"), ("☆", "Save current page"), ("◒", "Privacy shield"), ("⚙", "Settings")] {
                if ui.selectable_label(false, format!("{glyph}   {label}")).clicked() {
                    match label { "New tab" => self.new_tab(), "Privacy shield" => self.shield = !self.shield, "Settings" => self.view = View::Settings, _ => self.notify("Save from the browser window") }
                    self.command_open = false;
                }
            }
            if response.lost_focus() && ui.input(|input| input.key_pressed(egui::Key::Enter)) { let query = self.query.clone(); self.command_open = false; self.search(&query); }
        });
    }
}

impl App for SreonApp {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut Frame) {
        #[cfg(target_os = "linux")]
        while gtk::events_pending() { gtk::main_iteration_do(false); }
        self.apply_theme(ctx);
        let command = ctx.input(|input| input.modifiers.command || input.modifiers.ctrl);
        if command && ctx.input(|input| input.key_pressed(egui::Key::K)) { self.command_open = !self.command_open; }
        if command && ctx.input(|input| input.key_pressed(egui::Key::T)) { self.new_tab(); }
        if ctx.input(|input| input.key_pressed(egui::Key::Escape)) { self.command_open = false; self.customize_open = false; }

        self.sidebar(ctx);
        egui::CentralPanel::default().frame(egui::Frame::none().fill(if self.theme == Theme::Dark { BG } else { Color32::from_rgb(244, 240, 233) })).show(ctx, |ui| {
            self.paint_shell(ui);
            self.chrome(ui);
            ui.separator();
            egui::ScrollArea::vertical().id_source("content").show(ui, |ui| {
                ui.set_max_width(1000.0);
                ui.horizontal(|ui| { ui.add_space(35.0); ui.allocate_ui_with_layout(Vec2::new((ui.available_width() - 35.0).max(100.0), ui.available_height()), Layout::top_down(Align::LEFT), |ui| { match self.view { View::Home => self.home(ui), View::Tabs => self.tabs_page(ui), View::Bookmarks => self.bookmarks_page(ui), View::History => self.history_page(ui), View::Downloads => self.downloads_page(ui), View::Privacy => self.privacy_page(ui), View::Settings => self.settings_page(ui) } }); });
            });
            ui.with_layout(Layout::bottom_up(Align::LEFT), |ui| { ui.separator(); ui.add_space(5.0); ui.label(RichText::new(format!("●  {}   ·   Local profile   ·   Sreon 1.0", if self.shield { "Privacy shield active" } else { "Shield paused" })).size(9.0).color(DIM).family(egui::FontFamily::Monospace)); });
        });
        if self.customize_open { self.customizer(ctx); }
        if self.command_open { self.command_palette(ctx); }
        self.sync_webview(ctx);
        if let Some((message, at)) = &self.toast { if at.elapsed() < Duration::from_secs(3) { egui::Area::new("toast".into()).anchor(egui::Align2::RIGHT_BOTTOM, [-22.0, -25.0]).show(ctx, |ui| { egui::Frame::none().fill(PANEL_RAISED).rounding(egui::Rounding::same(8.0)).inner_margin(egui::Margin::symmetric(12.0, 9.0)).show(ui, |ui| { ui.label(RichText::new(format!("✓  {message}")).size(11.0)); }); }); ctx.request_repaint_after(Duration::from_millis(100)); } else { self.toast = None; } }
    }
}

const SREON_WEBVIEW_SCRIPT: &str = r#"
(() => {
  if (window.__sreonInjected) return;
  window.__sreonInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    :root { --sreon-purple: #ad92f7; --sreon-ink: #211b2c; color-scheme: dark !important; }
    html, body { background: #17131e !important; color: #f8f4ec !important; color-scheme: dark !important; }
    body { padding-top: 52px !important; }
    a { color: #cdbbff !important; }
    input, textarea, select, button { color: #f8f4ec !important; background: #241e2d !important; border-color: rgba(255,255,255,.16) !important; }
    #b_logo, .b_logo, #b_header .b_logo { display: none !important; }
    #b_header, #b_content, #b_results, #b_tween, #b_pole { background: #17131e !important; color: #f8f4ec !important; }
    #b_results .b_algo { background: #211b2c !important; border-color: rgba(255,255,255,.1) !important; border-radius: 10px !important; padding: 14px !important; margin-bottom: 10px !important; }
    #sreon-web-bar { position: fixed; z-index: 2147483647; inset: 0 0 auto 0; height: 52px; display: flex; align-items: center; gap: 10px; padding: 0 18px; color: #f8f4ec; background: rgba(29,24,39,.96); border-bottom: 1px solid rgba(255,255,255,.12); box-shadow: 0 8px 25px rgba(0,0,0,.14); font: 12px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif; }
    #sreon-web-bar .sreon-mark { display: inline-grid; place-items: center; width: 27px; height: 27px; color: #241c35; background: linear-gradient(145deg,#cdbbff,#9274ed); border-radius: 9px; }
    #sreon-web-bar .sreon-mark svg { width: 20px; height: 20px; }
    #sreon-web-bar .sreon-mark path { fill: #241c35; }
    #sreon-web-bar .sreon-mark circle { fill: #fbf7ed; }
    #sreon-web-bar .sreon-name {  font-weight: 700; letter-spacing: .12em; }
    #sreon-web-bar .sreon-context { margin-left: 5px; color: #aaa0b2; font-size: 10px; letter-spacing: .08em; }
    #sreon-web-bar .sreon-dot { width: 5px; height: 5px; margin-left: auto; background: #8ac7b5; border-radius: 50%; box-shadow: 0 0 0 4px rgba(138,199,181,.12); }
    #sreon-web-bar .sreon-protected { color: #8ac7b5; font-size: 10px; }
  `;
  document.head.appendChild(style);
  const bar = document.createElement('div');
  bar.id = 'sreon-web-bar';
  bar.innerHTML = '<span class="sreon-mark"><svg viewBox="0 0 128 128" aria-label="Sreon"><path d="M89.2 38.2c-7.1-7.1-16.2-10.7-27.3-10.7-16.5 0-27.6 7.7-27.6 20 0 13 11.1 17.5 27.9 20.4 11 1.9 14.6 4.1 14.6 8.5 0 4.6-4.4 7.2-12.6 7.2-9.7 0-16.3-3.1-22.6-9.4l-8.8 11.2c7.9 8.2 18.1 12.3 30.9 12.3 17.6 0 29.2-8.1 29.2-21.2 0-12.9-9.4-18.3-27-21.3-11.5-2-15.5-3.7-15.5-7.8 0-3.9 4.1-6.2 11.7-6.2 8.6 0 14.3 2.6 19.4 7.7z"/><circle cx="99" cy="29" r="5"/></svg></span><span class="sreon-name">SREON</span><span class="sreon-context">SEARCH / OPEN WEB</span><span class="sreon-dot"></span><span class="sreon-protected">PROTECTED</span>';
  document.documentElement.appendChild(bar);
})();
"#;

fn open_download_folder() {
    if let Some(home) = directories::UserDirs::new().and_then(|dirs| dirs.download_dir().map(|path| path.to_path_buf())) {
        let _ = open::that(home);
    } else { let _ = open::that("."); }
}

fn main() {
    let native_options = NativeOptions { viewport: egui::ViewportBuilder::default().with_inner_size([1360.0, 860.0]).with_min_inner_size([960.0, 620.0]).with_title("Sreon"), ..Default::default() };
    if let Err(error) = eframe::run_native("Sreon", native_options, Box::new(|cc| Ok(Box::new(SreonApp::new(cc))))) {
        eprintln!("Sreon error: {error}");
    }
}
