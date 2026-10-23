use super::types::{MAX_SIDEBAR_WIDTH, MIN_SIDEBAR_WIDTH, SidebarUi};

impl SidebarUi {
    pub fn drag_resize(&mut self, x: f32, screen_width: f32) -> bool {
        if self.is_resizing {
            let max = (screen_width * 0.8).min(MAX_SIDEBAR_WIDTH);
            let new_width = x.clamp(MIN_SIDEBAR_WIDTH, max);
            if (new_width - self.width).abs() > 0.01 {
                self.width = new_width;
                return true;
            }
        }
        false
    }
}
