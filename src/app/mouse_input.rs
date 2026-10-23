use super::types::App;
use ui::HeaderAction;
use winit::event::{ElementState, MouseButton};
use winit::event_loop::ActiveEventLoop;

impl App {
    pub(crate) fn handle_mouse_input(
        &mut self,
        event_loop: &ActiveEventLoop,
        button_state: ElementState,
        button: MouseButton,
    ) {
        if button_state != ElementState::Pressed || button != MouseButton::Left {
            return;
        }

        let Some(state) = &mut self.state else {
            return;
        };

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
