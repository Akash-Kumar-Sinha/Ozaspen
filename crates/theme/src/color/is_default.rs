use super::types::Color;

impl Color {
    pub fn is_default(&self) -> bool {
        matches!(self, Color::Default)
    }
}
