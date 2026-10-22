use std::error::Error;
use std::sync::OnceLock;
use winit::event_loop::{ControlFlow, EventLoop};

use theme::Theme;

mod app;
mod window;

static THEME: OnceLock<Theme> = OnceLock::new();

pub fn theme() -> &'static Theme {
    THEME.get_or_init(Theme::dark)
}

pub fn with_theme<R>(f: impl FnOnce(&Theme) -> R) -> R {
    f(theme())
}

fn main() -> Result<(), Box<dyn Error>> {
    let rt = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?;

    let event_loop = EventLoop::new()?;
    event_loop.set_control_flow(ControlFlow::Wait);

    let mut app = app::App::new(rt);
    event_loop.run_app(&mut app)?;

    Ok(())
}
