use super::types::App;
use tokio::runtime::Runtime;

impl App {
    pub fn new(rt: Runtime) -> Self {
        Self {
            rt,
            state: None,
            cursor_pos: (0.0, 0.0),
        }
    }
}
