use super::types::{RESIZE_HANDLE_WIDTH, SidebarUi};

impl SidebarUi {
    pub fn start_resizing(&mut self, x: f32, y: f32, header_height: f32) -> bool {
        if self.open && y >= header_height {
            let half = RESIZE_HANDLE_WIDTH * 0.5;
            let edge_x = self.width;
            if (edge_x - half..=edge_x + half).contains(&x) {
                self.is_resizing = true;
                return true;
            }
        }
        false
    }
}
