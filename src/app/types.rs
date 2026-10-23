use crate::window::RenderState;
use tokio::runtime::Runtime;
use winit::keyboard::ModifiersState;

pub struct App {
    pub(crate) rt: Runtime,
    pub(crate) state: Option<RenderState>,
    pub(crate) cursor_pos: (f32, f32),
    pub(crate) modifiers: ModifiersState,
}
