pub const DEFAULT_SIDEBAR_WIDTH: f32 = 300.0;
pub const MIN_SIDEBAR_WIDTH: f32 = 120.0;
pub const MAX_SIDEBAR_WIDTH: f32 = 600.0;
pub const RESIZE_HANDLE_WIDTH: f32 = 8.0;

#[derive(Clone, Debug, PartialEq)]
pub struct SidebarUi {
    pub open: bool,
    pub width: f32,
    pub is_resizing: bool,
    pub is_hovering_edge: bool,
}

impl Default for SidebarUi {
    fn default() -> Self {
        Self::new()
    }
}
