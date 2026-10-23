use std::error::Error;
use winit::event_loop::{ControlFlow, EventLoop};

mod app;
mod theme;
mod window;

pub use theme::{theme, with_theme};

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
