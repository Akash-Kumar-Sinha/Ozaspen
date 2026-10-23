use super::types::App;
use winit::window::{Cursor, CursorIcon};

impl App {
    pub(crate) fn handle_cursor_left(&mut self) {
        if let Some(state) = &mut self.state
            && state.header.clear_hover()
        {
            state.window.set_cursor(Cursor::Icon(CursorIcon::Default));
            state.window.request_redraw();
        }
    }
}
