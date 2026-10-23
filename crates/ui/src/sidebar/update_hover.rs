use super::types::{RESIZE_HANDLE_WIDTH, SidebarUi};

impl SidebarUi {
    pub fn update_hover(&mut self, x: f32, y: f32, header_height: f32) -> bool {
        if !self.open {
            let previous = self.is_hovering_edge;
            self.is_hovering_edge = false;
            return previous;
        }

        let previous = self.is_hovering_edge;
        if y < header_height {
            self.is_hovering_edge = false;
        } else {
            let half = RESIZE_HANDLE_WIDTH * 0.5;
            let edge_x = self.width;
            self.is_hovering_edge = (edge_x - half..=edge_x + half).contains(&x);
        }

        previous != self.is_hovering_edge
    }
}
