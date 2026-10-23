use super::types::RenderState;
use crate::theme;
use std::time::Instant;
use ui::HEADER_HEIGHT;

impl RenderState {
    pub fn render(&mut self) {
        let now = Instant::now();
        let dt = (now - self.last_frame).as_secs_f32();
        self.last_frame = now;

        self.toggle.update(dt, &self.queue);

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
                    self.sidebar.draw(
                        &self.device,
                        &self.queue,
                        &mut render_pass,
                        &self.ui_renderer,
                        screen_size,
                        HEADER_HEIGHT,
                    );
                    self.header.draw(
                        &self.device,
                        &self.queue,
                        &mut render_pass,
                        &self.ui_renderer,
                        screen_size,
                    );
                    self.toggle.render(&mut render_pass);
                }

                self.queue.submit(std::iter::once(encoder.finish()));
                self.queue.present(frame);

                if self.toggle.is_animating() {
                    self.window.request_redraw();
                }
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
