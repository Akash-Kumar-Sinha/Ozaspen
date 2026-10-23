use super::types::SidebarUi;

impl SidebarUi {
    pub fn stop_resizing(&mut self) -> bool {
        let was_resizing = self.is_resizing;
        self.is_resizing = false;
        was_resizing
    }
}
