use super::types::Theme;
use crate::color::srgb_to_linear;

impl Theme {
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
