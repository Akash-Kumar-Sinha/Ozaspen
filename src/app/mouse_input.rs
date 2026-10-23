use super::types::App;
use ui::{HEADER_HEIGHT, HeaderAction, HoveredButton, ToggleAction, ToggleVariant};
use winit::event::{ElementState, MouseButton};
use winit::event_loop::ActiveEventLoop;
use winit::window::{Cursor, CursorIcon};

impl App {
    pub(crate) fn handle_mouse_input(
        &mut self,
        event_loop: &ActiveEventLoop,
        button_state: ElementState,
        button: MouseButton,
    ) {
        if button != MouseButton::Left {
            return;
        }

        let Some(state) = &mut self.state else {
            return;
        };

        if button_state == ElementState::Released {
            state.toggle.pointer_release();
            if state.sidebar.is_resizing {
                state.sidebar.stop_resizing();
                state
                    .sidebar
                    .update_hover(self.cursor_pos.0, self.cursor_pos.1, HEADER_HEIGHT);
                let cursor = if state.sidebar.is_hovering_edge {
                    Cursor::Icon(CursorIcon::ColResize)
                } else if state.toggle.is_hovered() {
                    Cursor::Icon(CursorIcon::Pointer)
                } else {
                    Cursor::Icon(CursorIcon::Default)
                };
                state.window.set_cursor(cursor);
                state.window.request_redraw();
            }
            return;
        }

        if let Some(action) = state.toggle.pointer_press() {
            let is_open = match action {
                ToggleAction::Opened => true,
                ToggleAction::Closed => false,
                ToggleAction::Toggled(v) => v == ToggleVariant::Open,
            };
            state.sidebar.open = is_open;
            if !is_open {
                state.sidebar.is_resizing = false;
                state.sidebar.is_hovering_edge = false;
            }
            state
                .sidebar
                .update_hover(self.cursor_pos.0, self.cursor_pos.1, HEADER_HEIGHT);
            let cursor = if state.sidebar.is_hovering_edge {
                Cursor::Icon(CursorIcon::ColResize)
            } else if state.toggle.is_hovered() || state.header.hovered != HoveredButton::None {
                Cursor::Icon(CursorIcon::Pointer)
            } else {
                Cursor::Icon(CursorIcon::Default)
            };
            state.window.set_cursor(cursor);
            state.window.request_redraw();
            return;
        }

        if state.sidebar.is_hovering_edge {
            state
                .sidebar
                .start_resizing(self.cursor_pos.0, self.cursor_pos.1, HEADER_HEIGHT);
            state.window.set_cursor(Cursor::Icon(CursorIcon::ColResize));
            return;
        }

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
