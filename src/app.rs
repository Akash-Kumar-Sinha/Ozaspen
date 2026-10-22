use std::sync::Arc;
use tokio::runtime::Runtime;
use winit::application::ApplicationHandler;
use winit::dpi::LogicalSize;
use winit::event::WindowEvent;
use winit::event_loop::ActiveEventLoop;
use winit::window::{WindowAttributes, WindowId};

use crate::theme;
use crate::window::RenderState;

pub struct App {
    rt: Runtime,
    state: Option<RenderState>,
}

impl App {
    pub fn new(rt: Runtime) -> Self {
        Self { rt, state: None }
    }
}

impl ApplicationHandler for App {
    fn resumed(&mut self, event_loop: &ActiveEventLoop) {
        if self.state.is_none() {
            let window_attributes = WindowAttributes::default()
                .with_title(format!("Ozaspen - {}", theme().name))
                .with_inner_size(LogicalSize::new(800.0, 600.0));

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

    fn window_event(
        &mut self,
        event_loop: &ActiveEventLoop,
        _window_id: WindowId,
        event: WindowEvent,
    ) {
        match event {
            WindowEvent::CloseRequested => {
                event_loop.exit();
            }
            WindowEvent::Resized(physical_size) => {
                if let Some(state) = &mut self.state {
                    state.resize(physical_size);
                }
            }
            WindowEvent::RedrawRequested => {
                if let Some(state) = &mut self.state {
                    state.render();
                }
            }
            _ => (),
        }
    }
}
