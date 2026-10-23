use super::types::App;
use winit::window::{Cursor, CursorIcon};

impl App {
    pub(crate) fn handle_cursor_left(&mut self) {
        let Some(state) = &mut self.state else {
            return;
        };

        state.toggle.pointer_leave();

        if state.sidebar.is_resizing {
            return;
        }

        let header_changed = state.header.clear_hover();
        let sidebar_changed = state.sidebar.is_hovering_edge;
        state.sidebar.is_hovering_edge = false;

        if header_changed || sidebar_changed {
            state.window.set_cursor(Cursor::Icon(CursorIcon::Default));
            state.window.request_redraw();
        }
    }
}
