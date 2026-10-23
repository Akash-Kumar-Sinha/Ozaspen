use super::types::App;
use ui::HoveredButton;
use winit::window::{Cursor, CursorIcon};

impl App {
    pub(crate) fn handle_cursor_moved(&mut self, x: f32, y: f32) {
        self.cursor_pos = (x, y);
        if let Some(state) = &mut self.state {
            let changed = state.header.update_hover(
                self.cursor_pos.0,
                self.cursor_pos.1,
                state.size.width as f32,
            );
            let cursor = if state.header.hovered != HoveredButton::None {
                Cursor::Icon(CursorIcon::Pointer)
            } else {
                Cursor::Icon(CursorIcon::Default)
            };
            state.window.set_cursor(cursor);
            if changed {
                state.window.request_redraw();
            }
        }
    }
}
