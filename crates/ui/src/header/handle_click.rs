use super::types::{BTN_RADIUS, BTN_SPACING, HEADER_HEIGHT, HeaderAction, HeaderUi};

impl HeaderUi {
    pub fn handle_click(&self, x: f32, y: f32, width: f32) -> HeaderAction {
        if !(0.0..=HEADER_HEIGHT).contains(&y) {
            return HeaderAction::None;
        }

        if x <= 42.0 {
            return HeaderAction::None;
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

        if hit(close_cx) {
            HeaderAction::Close
        } else if hit(max_cx) {
            HeaderAction::Maximize
        } else if hit(min_cx) {
            HeaderAction::Minimize
        } else {
            HeaderAction::Drag
        }
    }
}
