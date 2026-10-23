use super::types::SidebarUi;
use renderer::{UiBatch, UiRenderer};
use theme::COLOR_NEAR_BLACK;

impl SidebarUi {
    pub fn draw(
        &self,
        device: &wgpu::Device,
        queue: &wgpu::Queue,
        render_pass: &mut wgpu::RenderPass<'_>,
        renderer: &UiRenderer,
        screen_size: [f32; 2],
        header_height: f32,
    ) {
        if !self.open || self.width <= 0.0 {
            return;
        }

        let mut batch = UiBatch::new();
        let height = (screen_size[1] - header_height).max(0.0);
        // Sidebar has COLOR_NEAR_BLACK background and no border
        batch.add_rect(0.0, header_height, self.width, height, COLOR_NEAR_BLACK);

        renderer.draw(device, queue, render_pass, screen_size, &batch, None);
    }
}
