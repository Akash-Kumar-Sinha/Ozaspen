use super::types::{DEFAULT_SIDEBAR_WIDTH, SidebarUi};

impl SidebarUi {
    #[must_use]
    pub fn new() -> Self {
        Self {
            open: true,
            width: DEFAULT_SIDEBAR_WIDTH,
            is_resizing: false,
            is_hovering_edge: false,
        }
    }
}
