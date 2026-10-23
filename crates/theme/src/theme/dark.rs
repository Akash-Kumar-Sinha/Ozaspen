use super::constants::*;
use super::types::Theme;
use crate::color::rgb;

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
}
