//! kavro.rs - LOCAL / OFFLINE COMPATIBILITY STUB runtime module.
//!
//! Exists only so the offline full-access build can export/build source without
//! the encrypted payload. It mirrors the API generated ui.rs / project.rs call,
//! but performs no real imgui-rs drawing. The legacy `kavro` / `Kavro`
//! identifiers are generated-code contracts, not branding.
//!
//! New design-time widgets (badge, stat, rating, stepper, breadcrumb) are
//! emitted as calls to these existing methods, so no new API is needed.

#![allow(dead_code, non_snake_case, unused_variables)]

use imgui::Ui;
use std::collections::HashMap;

/// Generated pages use `&mut Wicked` in their signatures.
pub type Wicked = Kavro;
pub type PageFn = fn(&mut Kavro, &Ui);

#[derive(Default, Clone)]
pub struct Area {
    pub id: String,
    pub text: String,
    pub pos: [f32; 2],
    pub size: [f32; 2],
}

#[derive(Default, Clone)]
pub struct FontReq {
    pub size: f32,
    pub bold: bool,
    pub family: i32,
    pub asset: i32,
}

#[derive(Default, Clone)]
pub struct WindowCfg {
    pub width: i32,
    pub height: i32,
    pub title: String,
    pub borderless: bool,
    pub resizable: bool,
    pub topmost: bool,
    pub centered: bool,
    pub rounding: f32,
    pub border_size: f32,
    pub border_color: u32,
    pub bg_type: i32,
    pub bg: u32,
    pub bg2: u32,
    pub bg_dir: i32,
    pub bg_image: i32,
    pub bg_image_opacity: f32,
    pub open_anim: i32,
    pub open_dur: f32,
    pub page_anim: i32,
    pub page_dur: f32,
    pub drag_mode: i32,
    pub fullscreen: bool,
    pub fs_key: bool,
    pub animations: bool,
}

#[derive(Default, Clone)]
pub struct TitlebarCfg {
    pub enabled: bool,
    pub height: f32,
    pub bg: u32,
    pub bg2: u32,
    pub gradient: bool,
    pub title: String,
    pub show_title: bool,
    pub align: i32,
    pub title_color: u32,
    pub title_size: f32,
    pub title_bold: bool,
    pub icon: i32,
    pub icon_size: f32,
    pub buttons: i32,
    pub show_minimize: bool,
    pub show_close: bool,
    pub btn_color: u32,
    pub btn_hover: u32,
    pub close_hover: u32,
    pub line: i32,
    pub line_color: u32,
    pub draggable: bool,
}

#[derive(Default, Clone)]
pub struct BackgroundCfg {
    pub effect: i32,
    pub count: i32,
    pub speed: f32,
    pub size: f32,
    pub opacity: f32,
    pub link_dist: f32,
    pub color: u32,
    pub color2: u32,
    pub mouse: bool,
}

#[derive(Default, Clone)]
pub struct ThemeCfg {
    pub font_size: f32,
    pub font: i32,
    pub font_asset: i32,
    pub toast_pos: i32,
    pub toast_bg: u32,
    pub text: u32,
    pub text_dim: u32,
    pub accent: u32,
    pub accent2: u32,
    pub frame: u32,
    pub border: u32,
}

#[derive(Default, Clone)]
pub struct ToastCfg {
    pub area: i32,
    pub pos: i32,
    pub off_x: f32,
    pub off_y: f32,
    pub duration: f32,
    pub max_visible: i32,
    pub anim: i32,
    pub anim_dur: f32,
    pub progress: bool,
    pub bg: u32,
    pub text: u32,
    pub border: u32,
    pub border_kind: bool,
    pub c_info: u32,
    pub c_success: u32,
    pub c_warning: u32,
    pub c_error: u32,
    pub progress_color: u32,
    pub progress_kind: bool,
    pub shadow_color: u32,
    pub width: f32,
    pub height: f32,
    pub padding: f32,
    pub rounding: f32,
    pub border_size: f32,
    pub gap: f32,
    pub icon: i32,
    pub icon_size: f32,
    pub font_size: f32,
    pub bold: bool,
    pub align: i32,
    pub outline: u32,
    pub outline_size: f32,
    pub tshadow: u32,
    pub tshadow_x: f32,
    pub tshadow_y: f32,
    pub accent: i32,
    pub shadow: bool,
    pub shadow_size: f32,
}

#[derive(Default, Clone)]
pub struct Config {
    pub window: WindowCfg,
    pub titlebar: TitlebarCfg,
    pub background: BackgroundCfg,
    pub theme: ThemeCfg,
    pub toast: ToastCfg,
    pub fonts: Vec<FontReq>,
    pub start_page: String,
}

#[derive(Default, Clone)]
pub struct WidgetStyle {
    pub opacity: f32,
    pub anim: i32,
    pub anim_delay: f32,
    pub anim_dur: f32,
    pub anim_speed: f32,
    pub visible_if: String,
    pub tooltip: String,
    pub disabled: bool,
    pub enabled_if: String,
    pub no_anim: bool,
    pub parent: String,
    pub font: i32,
    pub font_asset: i32,
    pub color: u32,
    pub color2: u32,
    pub font_size: f32,
    pub bold: bool,
    pub align: i32,
    pub wrap: bool,
    pub letter_spacing: f32,
    pub underline: bool,
    pub outline: u32,
    pub outline_size: f32,
    pub tshadow: u32,
    pub tshadow_x: f32,
    pub tshadow_y: f32,
    pub gradient: bool,
    pub variant: i32,
    pub bg: u32,
    pub bg_hover: u32,
    pub bg_active: u32,
    pub bg2: u32,
    pub grad_dir: i32,
    pub text: u32,
    pub text_active: u32,
    pub border: u32,
    pub border_size: f32,
    pub rounding: f32,
    pub hand_cursor: bool,
}

/// Color helper used by generated style/config assignments.
pub fn rgba(r: u8, g: u8, b: u8, a: u8) -> u32 {
    ((a as u32) << 24) | ((b as u32) << 16) | ((g as u32) << 8) | r as u32
}

/// Offline runtime state: config, registered pages/styles and widget values.
pub struct Kavro {
    pub cfg: Config,
    pages: Vec<(String, String, PageFn)>,
    styles: HashMap<String, WidgetStyle>,
    state: HashMap<String, String>,
    assets: Vec<Vec<u8>>,
}

impl Default for Kavro {
    fn default() -> Self {
        Self::new()
    }
}

// Every generated widget call has this shape; all return bool so
// `if k.button(...) { ... }` actions keep compiling.
macro_rules! stub_widgets {
    ($($name:ident),* $(,)?) => {
        $(
            pub fn $name(&mut self, _ui: &Ui, _id: &str, _text: &str,
                         _pos: [f32; 2], _size: [f32; 2]) -> bool {
                false
            }
        )*
    };
}

impl Kavro {
    pub fn new() -> Self {
        Self {
            cfg: Config::default(),
            pages: Vec::new(),
            styles: HashMap::new(),
            state: HashMap::new(),
            assets: Vec::new(),
        }
    }

    /// Hook for generated project.rs configuration; a no-op in this stub.
    pub fn configure(&mut self) {}

    pub fn add_page(&mut self, id: &str, name: &str, page: PageFn) {
        self.pages.push((id.to_string(), name.to_string(), page));
    }

    pub fn def(&mut self, id: &str) -> &mut WidgetStyle {
        self.styles.entry(id.to_string()).or_default()
    }

    pub fn add_asset(&mut self, _index: usize, data: &[u8]) {
        self.assets.push(data.to_vec());
    }

    pub fn init(&mut self) { /* offline stub: no context/window created */ }
    pub fn frame(&mut self) { /* offline stub: generated pages would draw here */ }

    pub fn get_bool(&self, id: &str) -> bool {
        self.get_text(id) == "true"
    }
    pub fn get_float(&self, id: &str) -> f32 {
        self.get_text(id).parse().unwrap_or(0.0)
    }
    pub fn get_int(&self, id: &str) -> i32 {
        self.get_text(id).parse().unwrap_or(0)
    }
    pub fn get_text(&self, id: &str) -> String {
        self.state.get(id).cloned().unwrap_or_default()
    }
    pub fn set(&mut self, id: &str, value: &str) {
        self.state.insert(id.to_string(), value.to_string());
    }

    pub fn goto(&mut self, page: &str) { let _ = page; }
    pub fn toast(&mut self, text: &str, kind: &str) { let _ = (text, kind); }
    pub fn load(&mut self, target: &str, seconds: f32, page: &str) { let _ = (target, seconds, page); }
    pub fn login(&mut self, user_field: &str, pass_field: &str, user: &str, pass: &str, page: &str, error: &str) {
        let _ = (user_field, pass_field, user, pass, page, error);
    }
    pub fn key_login(&mut self, key_field: &str, keys: &str, page: &str, error: &str) {
        let _ = (key_field, keys, page, error);
    }
    pub fn toggle(&mut self, target: &str) { let _ = target; }
    pub fn open_url(&mut self, url: &str) { let _ = url; }
    pub fn webhook(&mut self, url: &str, payload: &str, method: &str) { let _ = (url, payload, method); }
    pub fn discord(&mut self, url: &str, message: &str, username: &str) { let _ = (url, message, username); }
    pub fn run(&mut self, path: &str) { let _ = path; }
    pub fn copy(&mut self, text: &str) { let _ = text; }
    pub fn minimize(&mut self) {}
    pub fn close(&mut self) {}
    pub fn fullscreen(&mut self) {}

    stub_widgets!(
        text, button, checkbox, switch, slider, input, combo, progress,
        separator, image, panel, tabs, list, spinner, colorpicker, hotkey,
        shape, radio, header, table, plot, textarea, number,
    );

    pub fn custom(
        &mut self,
        ui: &Ui,
        id: &str,
        text: &str,
        pos: [f32; 2],
        size: [f32; 2],
        draw: fn(&mut Kavro, &Ui, &mut Area),
    ) -> bool {
        let mut area = Area {
            id: id.to_string(),
            text: text.to_string(),
            pos,
            size,
        };
        draw(self, ui, &mut area);
        false
    }

    // Overlay-menu helpers used by generated src/menu.rs. No-ops in this
    // offline stub; a full build implements a toggleable in-game overlay menu.
    pub fn pressed(&self, _key: &str) -> bool { false }
    pub fn begin_menu_window(&mut self, _ui: &Ui, _title: &str) { }
    pub fn end_menu_window(&mut self, _ui: &Ui) { }
    pub fn menu_tab(&mut self, _ui: &Ui, _name: &str) -> bool { false }
    pub fn menu_toggle(&mut self, _ui: &Ui, _id: &str, _label: &str) -> bool { false }
    pub fn menu_slider(&mut self, _ui: &Ui, _id: &str, _label: &str, _min: f32, _max: f32) -> bool { false }
    pub fn menu_combo(&mut self, _ui: &Ui, _id: &str, _label: &str) -> bool { false }
    pub fn menu_button(&mut self, _ui: &Ui, _id: &str, _label: &str) -> bool { false }
    pub fn menu_label(&mut self, _ui: &Ui, _label: &str) { }
}

/// Entry point used by main.rs. A full build calls
/// `crate::project::configure(&mut k)` here; the offline stub cannot depend on
/// generated modules, so it returns a freshly configured runtime instead.
pub fn configure() -> Kavro {
    let mut k = Kavro::new();
    k.configure();
    k
}
