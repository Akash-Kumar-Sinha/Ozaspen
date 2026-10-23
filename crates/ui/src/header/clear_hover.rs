use super::types::{HeaderUi, HoveredButton};

impl HeaderUi {
    pub fn clear_hover(&mut self) -> bool {
        let previous = self.hovered;
        self.hovered = HoveredButton::None;
        previous != self.hovered
    }
}
