use super::types::App;
use crate::window::RenderState;
use std::sync::Arc;
use winit::dpi::LogicalSize;
use winit::event_loop::ActiveEventLoop;
use winit::window::WindowAttributes;

impl App {
    pub(crate) fn handle_resumed(&mut self, event_loop: &ActiveEventLoop) {
        if self.state.is_none() {
            let window_attributes = WindowAttributes::default()
                .with_title("Ozaspen")
                .with_decorations(false)
                .with_inner_size(LogicalSize::new(1600.0, 1000.0));

            let window = Arc::new(
                event_loop
                    .create_window(window_attributes)
                    .expect("failed to create window"),
            );

            let state =
                RenderState::new(window.clone(), &self.rt).expect("failed to initialize GPU state");
            self.state = Some(state);

            window.request_redraw();
        }
    }
}
