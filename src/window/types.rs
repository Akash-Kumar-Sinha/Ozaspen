use renderer::UiRenderer;
use std::sync::Arc;
use std::time::Instant;
use ui::{HeaderUi, SidebarUi, Toggle};
use winit::dpi::PhysicalSize;
use winit::window::Window;

pub struct RenderState {
    pub window: Arc<Window>,
    pub(crate) surface: wgpu::Surface<'static>,
    pub(crate) device: wgpu::Device,
    pub(crate) queue: wgpu::Queue,
    pub(crate) config: wgpu::SurfaceConfiguration,
    pub size: PhysicalSize<u32>,
    pub(crate) ui_renderer: UiRenderer,
    pub header: HeaderUi,
    pub sidebar: SidebarUi,
    pub toggle: Toggle,
    pub last_frame: Instant,
}
