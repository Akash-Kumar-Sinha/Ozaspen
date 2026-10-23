use super::types::App;
use ui::{HEADER_HEIGHT, ToggleVariant};
use winit::event::{ElementState, KeyEvent};
use winit::event_loop::ActiveEventLoop;
use winit::keyboard::{Key, KeyCode, PhysicalKey};

impl App {
    pub(crate) fn handle_keyboard_input(&mut self, event_loop: &ActiveEventLoop, event: KeyEvent) {
        if event.state != ElementState::Pressed || event.repeat {
            return;
        }

        let ctrl_or_cmd = self.modifiers.control_key() || self.modifiers.super_key();
        if !ctrl_or_cmd {
            return;
        }

        let is_key_b = match &event.logical_key {
            Key::Character(c) if c.eq_ignore_ascii_case("b") => true,
            _ => matches!(event.physical_key, PhysicalKey::Code(KeyCode::KeyB)),
        };

        let is_key_w = match &event.logical_key {
            Key::Character(c) if c.eq_ignore_ascii_case("w") => true,
            _ => matches!(event.physical_key, PhysicalKey::Code(KeyCode::KeyW)),
        };

        if is_key_b {
            if let Some(state) = &mut self.state {
                state.sidebar.toggle();
                let variant = if state.sidebar.open {
                    ToggleVariant::Open
                } else {
                    ToggleVariant::Close
                };
                state.toggle.set_variant(variant);
                state
                    .sidebar
                    .update_hover(self.cursor_pos.0, self.cursor_pos.1, HEADER_HEIGHT);
                state.window.request_redraw();
            }
        } else if is_key_w {
            event_loop.exit();
        }
    }
}
