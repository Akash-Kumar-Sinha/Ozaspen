use super::types::App;
use winit::event::Modifiers;

impl App {
    pub(crate) fn handle_modifiers_changed(&mut self, modifiers: Modifiers) {
        self.modifiers = modifiers.state();
    }
}
