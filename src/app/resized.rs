use super::types::App;
use winit::dpi::PhysicalSize;

impl App {
    pub(crate) fn handle_resized(&mut self, physical_size: PhysicalSize<u32>) {
        if let Some(state) = &mut self.state {
            state.resize(physical_size);
        }
    }
}
