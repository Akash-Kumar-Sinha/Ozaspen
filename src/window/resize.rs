use super::types::RenderState;
use ui::{HEADER_HEIGHT, TOGGLE_BTN_CX};
use winit::dpi::PhysicalSize;

impl RenderState {
    pub fn resize(&mut self, new_size: PhysicalSize<u32>) {
        if new_size.width > 0 && new_size.height > 0 {
            self.size = new_size;
            self.config.width = new_size.width;
            self.config.height = new_size.height;
            self.surface.configure(&self.device, &self.config);
            self.toggle.resize(new_size.width, new_size.height);
            self.toggle.set_scale(0.8);
            self.toggle.set_anchor(TOGGLE_BTN_CX, HEADER_HEIGHT * 0.5);
            self.window.request_redraw();
        }
    }
}
