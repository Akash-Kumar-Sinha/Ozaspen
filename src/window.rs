use std::error::Error;
use std::sync::Arc;
use tokio::runtime::Runtime;
use winit::dpi::PhysicalSize;
use winit::window::Window;

use renderer::{TextEngine, UiRenderer};
use ui::HeaderUi;
use crate::theme;

pub struct RenderState {
    pub window: Arc<Window>,
    surface: wgpu::Surface<'static>,
    device: wgpu::Device,
    queue: wgpu::Queue,
    config: wgpu::SurfaceConfiguration,
    pub size: PhysicalSize<u32>,
    ui_renderer: UiRenderer,
    pub header: HeaderUi,
}

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

        Ok(Self {
            window,
            surface,
            device,
            queue,
            config,
            size,
            ui_renderer,
            header,
        })
    }

    pub fn resize(&mut self, new_size: PhysicalSize<u32>) {
        if new_size.width > 0 && new_size.height > 0 {
            self.size = new_size;
            self.config.width = new_size.width;
            self.config.height = new_size.height;
            self.surface.configure(&self.device, &self.config);
            self.window.request_redraw();
        }
    }

    pub fn render(&mut self) {
        match self.surface.get_current_texture() {
            wgpu::CurrentSurfaceTexture::Success(frame)
            | wgpu::CurrentSurfaceTexture::Suboptimal(frame) => {
                let view = frame
                    .texture
                    .create_view(&wgpu::TextureViewDescriptor::default());

                let mut encoder =
                    self.device
                        .create_command_encoder(&wgpu::CommandEncoderDescriptor {
                            label: Some("Main Render Encoder"),
                        });

                let (r, g, b, a) = theme().clear_color_linear();

                {
                    let mut render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                        label: Some("UI Render Pass"),
                        color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                            view: &view,
                            resolve_target: None,
                            ops: wgpu::Operations {
                                load: wgpu::LoadOp::Clear(wgpu::Color { r, g, b, a }),
                                store: wgpu::StoreOp::Store,
                            },
                            depth_slice: None,
                        })],
                        depth_stencil_attachment: None,
                        occlusion_query_set: None,
                        timestamp_writes: None,
                        multiview_mask: None,
                    });

                    let screen_size = [self.size.width as f32, self.size.height as f32];
                    self.header.draw(
                        &self.device,
                        &self.queue,
                        &mut render_pass,
                        &self.ui_renderer,
                        screen_size,
                    );
                }

                self.queue.submit(std::iter::once(encoder.finish()));
                self.queue.present(frame);
            }
            wgpu::CurrentSurfaceTexture::Lost | wgpu::CurrentSurfaceTexture::Outdated => {
                self.resize(self.size);
            }
            wgpu::CurrentSurfaceTexture::Timeout
            | wgpu::CurrentSurfaceTexture::Occluded
            | wgpu::CurrentSurfaceTexture::Validation => {}
        }
    }
}
