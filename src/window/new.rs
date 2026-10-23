use super::types::RenderState;
use renderer::{TextEngine, UiRenderer};
use std::error::Error;
use std::sync::Arc;
use std::time::Instant;
use tokio::runtime::Runtime;
use ui::{HEADER_HEIGHT, HeaderUi, SidebarUi, TOGGLE_BTN_CX, Toggle};
use winit::window::Window;

impl RenderState {
    pub fn new(window: Arc<Window>, rt: &Runtime) -> Result<Self, Box<dyn Error>> {
        let size = window.inner_size();
        let width = size.width.max(1);
        let height = size.height.max(1);

        let instance = wgpu::Instance::default();
        let surface = instance.create_surface(window.clone())?;

        let adapter = rt.block_on(instance.request_adapter(&wgpu::RequestAdapterOptions {
            compatible_surface: Some(&surface),
            ..Default::default()
        }))?;

        let (device, queue) =
            rt.block_on(adapter.request_device(&wgpu::DeviceDescriptor::default()))?;

        let mut config = surface
            .get_default_config(&adapter, width, height)
            .ok_or("Surface configuration not supported by adapter")?;
        config.width = width;
        config.height = height;
        surface.configure(&device, &config);

        let ui_renderer = UiRenderer::new(&device, &queue, config.format);
        let mut text_engine = TextEngine::new();
        let header = HeaderUi::new(&device, &queue, &ui_renderer, &mut text_engine);
        let sidebar = SidebarUi::new();

        let mut toggle = Toggle::open(&device, config.format);
        toggle.resize(width, height);
        toggle.set_scale(0.8);
        toggle.set_anchor(TOGGLE_BTN_CX, HEADER_HEIGHT * 0.5);

        let last_frame = Instant::now();

        Ok(Self {
            window,
            surface,
            device,
            queue,
            config,
            size,
            ui_renderer,
            header,
            sidebar,
            toggle,
            last_frame,
        })
    }
}
