use super::types::App;
use ui::{HEADER_HEIGHT, HoveredButton};
use winit::window::{Cursor, CursorIcon};

impl App {
    pub(crate) fn handle_cursor_moved(&mut self, x: f32, y: f32) {
        self.cursor_pos = (x, y);
        let Some(state) = &mut self.state else {
            return;
        };

        if state.sidebar.is_resizing {
            let changed = state.sidebar.drag_resize(x, state.size.width as f32);
            state.window.set_cursor(Cursor::Icon(CursorIcon::ColResize));
            if changed {
                state.window.request_redraw();
            }
            return;
        }

        state
            .toggle
            .pointer_move(self.cursor_pos.0, self.cursor_pos.1);
        let toggle_hovered = state.toggle.is_hovered();

        let header_changed = state.header.update_hover(
            self.cursor_pos.0,
            self.cursor_pos.1,
            state.size.width as f32,
        );
        let sidebar_changed =
            state
                .sidebar
                .update_hover(self.cursor_pos.0, self.cursor_pos.1, HEADER_HEIGHT);

        let cursor = if state.sidebar.is_hovering_edge {
            Cursor::Icon(CursorIcon::ColResize)
        } else if toggle_hovered || state.header.hovered != HoveredButton::None {
            Cursor::Icon(CursorIcon::Pointer)
        } else {
            Cursor::Icon(CursorIcon::Default)
        };

        state.window.set_cursor(cursor);
        if toggle_hovered || header_changed || sidebar_changed {
            state.window.request_redraw();
        }
    }
}
