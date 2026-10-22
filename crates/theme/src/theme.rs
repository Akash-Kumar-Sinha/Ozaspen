use crate::color::{rgb, srgb_to_linear};

pub const COLOR_BLACK: [f32; 4] = rgb(0, 0, 0);
pub const COLOR_NEAR_BLACK: [f32; 4] = rgb(1, 1, 1);
pub const COLOR_WHITE: [f32; 4] = rgb(255, 255, 255);
pub const COLOR_RED: [f32; 4] = [0.74, 0.21, 0.16, 1.0];
pub const COLOR_GREEN: [f32; 4] = rgb(9, 232, 111);
pub const COLOR_YELLOW: [f32; 4] = [0.90, 0.63, 0.10, 1.0];
pub const COLOR_BLUE: [f32; 4] = [0.10, 0.67, 0.85, 1.0];
pub const COLOR_AMBER: [f32; 4] = [0.76, 0.50, 0.0, 1.0];
pub const COLOR_GRAY_MUTED: [f32; 4] = [0.65, 0.65, 0.70, 1.0];
pub const COLOR_GRAY_DARK: [f32; 4] = rgb(2, 2, 2);
pub const COLOR_GRAY_SURFACE: [f32; 4] = rgb(4, 4, 4);
pub const COLOR_GRAY_ELEVATED: [f32; 4] = rgb(1, 1, 1);
pub const COLOR_GRAY_CONTROL: [f32; 4] = rgb(5, 5, 5);
pub const COLOR_DIFF_ADD_BG: [f32; 4] = [0.008, 0.020, 0.008, 1.0];
pub const COLOR_DIFF_DELETE_BG: [f32; 4] = [0.020, 0.004, 0.004, 1.0];
pub const COLOR_DIFF_MODIFIED_BG: [f32; 4] = [0.020, 0.016, 0.004, 1.0];
pub const COLOR_DIFF_CHIP_DELETE_BG: [f32; 4] = [0.28, 0.10, 0.10, 1.0];
pub const COLOR_DIFF_CHIP_DELETE_FG: [f32; 4] = [0.95, 0.65, 0.65, 0.90];

#[derive(Clone, Debug, PartialEq)]
pub struct Theme {
    pub name: String,
    pub background: [f32; 4],
    pub foreground: [f32; 4],
    pub surface: [f32; 4],
    pub surface_raised: [f32; 4],
    pub header_background: [f32; 4],
    pub sidebar_background: [f32; 4],
    pub border: [f32; 4],
    pub border_subtle: [f32; 4],
    pub text_primary: [f32; 4],
    pub text_secondary: [f32; 4],
    pub text_muted: [f32; 4],
    pub accent: [f32; 4],
    pub accent_hover: [f32; 4],
    pub selection_background: [f32; 4],
    pub hover_background: [f32; 4],
    pub cursor: [f32; 4],
    pub red: [f32; 4],
    pub green: [f32; 4],
    pub yellow: [f32; 4],
    pub blue: [f32; 4],
    pub amber: [f32; 4],
    pub white: [f32; 4],
    pub black: [f32; 4],
}

impl Default for Theme {
    fn default() -> Self {
        Self::dark()
    }
}

impl Theme {
    #[must_use]
    pub fn dark() -> Self {
        Self {
            name: "Dark".to_string(),
            background: COLOR_BLACK,
            foreground: COLOR_WHITE,
            surface: COLOR_GRAY_SURFACE,
            surface_raised: COLOR_GRAY_ELEVATED,
            header_background: COLOR_NEAR_BLACK,
            sidebar_background: COLOR_NEAR_BLACK,
            border: COLOR_GRAY_DARK,
            border_subtle: COLOR_GRAY_DARK,
            text_primary: COLOR_WHITE,
            text_secondary: rgb(220, 220, 225),
            text_muted: COLOR_GRAY_MUTED,
            accent: COLOR_BLUE,
            accent_hover: [0.20, 0.77, 0.95, 1.0],
            selection_background: rgb(8, 8, 8),
            hover_background: COLOR_GRAY_DARK,
            cursor: COLOR_BLUE,
            red: COLOR_RED,
            green: COLOR_GREEN,
            yellow: COLOR_YELLOW,
            blue: COLOR_BLUE,
            amber: COLOR_AMBER,
            white: COLOR_WHITE,
            black: COLOR_BLACK,
        }
    }

    #[must_use]
    pub fn monochrome_black() -> Self {
        Self::dark()
    }

    #[must_use]
    pub fn clear_color_linear(&self) -> (f64, f64, f64, f64) {
        let [r, g, b, a] = self.background;
        (
            srgb_to_linear(r) as f64,
            srgb_to_linear(g) as f64,
            srgb_to_linear(b) as f64,
            a as f64,
        )
    }
}
