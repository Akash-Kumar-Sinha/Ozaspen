use super::types::App;

impl App {
    pub(crate) fn handle_redraw_requested(&mut self) {
        if let Some(state) = &mut self.state {
            state.render();
        }
    }
}
