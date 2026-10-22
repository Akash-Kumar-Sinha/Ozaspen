use std::sync::Arc;
use tokio::runtime::Runtime;
use ui::{pointer_cursor, HeaderAction, HoveredButton};
use winit::application::ApplicationHandler;
use winit::dpi::LogicalSize;
use winit::event::{ElementState, MouseButton, WindowEvent};
use winit::event_loop::ActiveEventLoop;
use winit::window::{Cursor, CursorIcon, CustomCursor, WindowAttributes, WindowId};

use crate::window::RenderState;

pub struct App {
    rt: Runtime,
    state: Option<RenderState>,
    cursor_pos: (f32, f32),
    custom_pointer: Option<CustomCursor>,
}

impl App {
    pub fn new(rt: Runtime) -> Self {
        Self {
            rt,
            state: None,
            cursor_pos: (0.0, 0.0),
            custom_pointer: None,
        }
    }
}

impl ApplicationHandler for App {
    fn resumed(&mut self, event_loop: &ActiveEventLoop) {
        if self.state.is_none() {
            let window_attributes = WindowAttributes::default()
                .with_title("Ozaspen")
                .with_decorations(false)
                .with_inner_size(LogicalSize::new(800.0, 600.0));

            let window = Arc::new(
                event_loop
                    .create_window(window_attributes)
                    .expect("failed to create window"),
            );

            if let Ok(source) = pointer_cursor() {
                self.custom_pointer = Some(event_loop.create_custom_cursor(source));
            }

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
            WindowEvent::CursorMoved { position, .. } => {
                self.cursor_pos = (position.x as f32, position.y as f32);
                if let Some(state) = &mut self.state {
                    let changed = state.header.update_hover(
                        self.cursor_pos.0,
                        self.cursor_pos.1,
                        state.size.width as f32,
                    );
                    let cursor = if state.header.hovered != HoveredButton::None {
                        if let Some(ref custom_pointer) = self.custom_pointer {
                            Cursor::Custom(custom_pointer.clone())
                        } else {
                            Cursor::Icon(CursorIcon::Pointer)
                        }
                    } else {
                        Cursor::Icon(CursorIcon::Default)
                    };
                    state.window.set_cursor(cursor);
                    if changed {
                        state.window.request_redraw();
                    }
                }
            }
            WindowEvent::CursorLeft { .. } => {
                if let Some(state) = &mut self.state {
                    if state.header.clear_hover() {
                        state.window.set_cursor(Cursor::Icon(CursorIcon::Default));
                        state.window.request_redraw();
                    }
                }
            }
            WindowEvent::MouseInput {
                state: ElementState::Pressed,
                button: MouseButton::Left,
                ..
            } => {
                if let Some(state) = &mut self.state {
                    let action = state.header.handle_click(
                        self.cursor_pos.0,
                        self.cursor_pos.1,
                        state.size.width as f32,
                    );
                    match action {
                        HeaderAction::Close => event_loop.exit(),
                        HeaderAction::Minimize => {
                            state.window.set_minimized(true);
                        }
                        HeaderAction::Maximize => {
                            let is_max = state.window.is_maximized();
                            state.window.set_maximized(!is_max);
                        }
                        HeaderAction::Drag => {
                            let _ = state.window.drag_window();
                        }
                        HeaderAction::None => {}
                    }
                }
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
