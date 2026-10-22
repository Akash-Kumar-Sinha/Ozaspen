use egui::{Color32, CornerRadius, FontId, Stroke, TextStyle, Visuals};
use ozaspen_content::NoteColor;

pub const BACKGROUND: Color32 = Color32::from_rgb(0x00, 0x00, 0x00);
pub const SURFACE: Color32 = Color32::from_rgb(0x0a, 0x0a, 0x0a);
pub const SURFACE_RAISED: Color32 = Color32::from_rgb(0x18, 0x18, 0x1b);
pub const BORDER: Color32 = Color32::from_rgb(0x27, 0x27, 0x2a);
pub const FOREGROUND: Color32 = Color32::from_rgb(0xff, 0xff, 0xff);
pub const MUTED: Color32 = Color32::from_rgb(0xa1, 0xa1, 0xaa);
pub const WARNING: Color32 = Color32::from_rgb(0xfe, 0xd7, 0xaa);
pub const DESTRUCTIVE: Color32 = Color32::from_rgb(0xef, 0x44, 0x44);

pub const NOTE_TEXT: Color32 = Color32::BLACK;
pub const NOTE_TEXT_MUTED: Color32 = Color32::from_rgb(0x52, 0x52, 0x5b);

pub const CARD_CORNER_RADIUS: u8 = 12;

#[must_use]
pub fn note_fill(color: NoteColor) -> Color32 {
    let [red, green, blue] = color.rgb();
    Color32::from_rgb(red, green, blue)
}

#[must_use]
pub fn note_header_fill(color: NoteColor) -> Color32 {
    mix(note_fill(color), Color32::from_rgb(0, 0, 0), 0.06)
}

#[must_use]
pub fn note_border(color: NoteColor) -> Color32 {
    mix(note_fill(color), Color32::from_rgb(0, 0, 0), 0.24)
}

pub fn banner_fill() -> Color32 {
    mix(SURFACE, DESTRUCTIVE, 0.18)
}

pub fn configure(ctx: &egui::Context) {
    let mut style = (*ctx.style_of(egui::Theme::Dark)).clone();

    let mut visuals = Visuals::dark();
    visuals.panel_fill = BACKGROUND;
    visuals.window_fill = SURFACE;
    visuals.extreme_bg_color = SURFACE;
    visuals.faint_bg_color = SURFACE_RAISED;
    visuals.window_corner_radius = CornerRadius::same(CARD_CORNER_RADIUS);
    visuals.window_stroke = Stroke::new(1.0, BORDER);
    visuals.widgets.noninteractive.bg_fill = SURFACE;
    visuals.widgets.noninteractive.bg_stroke = Stroke::new(1.0, BORDER);
    visuals.widgets.inactive.bg_fill = SURFACE_RAISED;
    visuals.widgets.inactive.fg_stroke = Stroke::new(1.0, FOREGROUND);
    visuals.widgets.inactive.corner_radius = CornerRadius::same(8);
    visuals.widgets.hovered.bg_fill = Color32::from_rgb(0x27, 0x27, 0x2a);
    visuals.widgets.hovered.fg_stroke = Stroke::new(1.0, FOREGROUND);
    visuals.widgets.hovered.corner_radius = CornerRadius::same(8);
    visuals.widgets.active.bg_fill = Color32::from_rgb(0x3f, 0x3f, 0x46);
    visuals.widgets.active.fg_stroke = Stroke::new(1.0, FOREGROUND);
    visuals.widgets.active.corner_radius = CornerRadius::same(8);
    visuals.selection.bg_fill = Color32::from_rgb(0x3f, 0x3f, 0x46);
    visuals.selection.stroke = Stroke::new(1.0, FOREGROUND);
    visuals.override_text_color = Some(FOREGROUND);
    style.visuals = visuals;

    style.spacing.item_spacing = egui::vec2(8.0, 8.0);
    style.spacing.button_padding = egui::vec2(10.0, 6.0);
    style
        .text_styles
        .insert(TextStyle::Body, FontId::proportional(14.0));
    style
        .text_styles
        .insert(TextStyle::Small, FontId::proportional(11.0));

    ctx.set_global_style(style);
}

fn mix(from: Color32, to: Color32, amount: f32) -> Color32 {
    let amount = amount.clamp(0.0, 1.0);
    let blend =
        |a: u8, b: u8| (f32::from(a) + (f32::from(b) - f32::from(a)) * amount).round() as u8;
    Color32::from_rgb(
        blend(from.r(), to.r()),
        blend(from.g(), to.g()),
        blend(from.b(), to.b()),
    )
}
