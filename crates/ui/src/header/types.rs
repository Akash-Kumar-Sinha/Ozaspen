use renderer::GpuText;

pub const HEADER_HEIGHT: f32 = 42.0;
pub(crate) const BTN_RADIUS: f32 = 12.0;
pub(crate) const BTN_SPACING: f32 = 40.0;
pub const TOGGLE_BTN_CX: f32 = 24.0;

#[derive(Copy, Clone, Debug, PartialEq, Eq, Default)]
pub enum HoveredButton {
    #[default]
    None,
    Minimize,
    Maximize,
    Close,
}

#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum HeaderAction {
    None,
    Minimize,
    Maximize,
    Close,
    Drag,
}

pub struct HeaderUi {
    pub(crate) title_text: GpuText,
    pub hovered: HoveredButton,
}
