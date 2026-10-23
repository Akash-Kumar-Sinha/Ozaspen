use super::types::SidebarUi;

impl SidebarUi {
    pub fn toggle(&mut self) {
        self.open = !self.open;
        if !self.open {
            self.is_resizing = false;
            self.is_hovering_edge = false;
        }
    }
}
