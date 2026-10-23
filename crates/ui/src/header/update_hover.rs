use super::types::{BTN_RADIUS, BTN_SPACING, HEADER_HEIGHT, HeaderUi, HoveredButton};

impl HeaderUi {
    pub fn update_hover(&mut self, x: f32, y: f32, width: f32) -> bool {
        let previous = self.hovered;

        if !(0.0..=HEADER_HEIGHT).contains(&y) {
            self.hovered = HoveredButton::None;
            return previous != self.hovered;
        }

        let cy = HEADER_HEIGHT * 0.5;
        let close_cx = width - 16.0 - BTN_RADIUS;
        let max_cx = close_cx - BTN_SPACING;
        let min_cx = max_cx - BTN_SPACING;

        let hit = |cx: f32| -> bool {
            let dx = x - cx;
            let dy = y - cy;
            dx.abs() <= BTN_RADIUS + 4.0 && dy.abs() <= BTN_RADIUS + 4.0
        };

        self.hovered = if hit(close_cx) {
            HoveredButton::Close
        } else if hit(max_cx) {
            HoveredButton::Maximize
        } else if hit(min_cx) {
            HoveredButton::Minimize
        } else {
            HoveredButton::None
        };

        previous != self.hovered
    }
}
