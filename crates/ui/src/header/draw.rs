use super::types::{BTN_RADIUS, BTN_SPACING, HEADER_HEIGHT, HeaderUi, HoveredButton};
use renderer::{UiBatch, UiRenderer};
use theme::{COLOR_GRAY_DARK, COLOR_GRAY_SURFACE, COLOR_NEAR_BLACK, COLOR_WHITE};

impl HeaderUi {
    pub fn draw(
        &self,
        device: &wgpu::Device,
        queue: &wgpu::Queue,
        render_pass: &mut wgpu::RenderPass<'_>,
        renderer: &UiRenderer,
        screen_size: [f32; 2],
    ) {
        let width = screen_size[0];
        let mut bg_batch = UiBatch::new();

        bg_batch.add_rect(0.0, 0.0, width, HEADER_HEIGHT, COLOR_NEAR_BLACK);

        let cy = HEADER_HEIGHT * 0.5;
        let close_cx = width - 16.0 - BTN_RADIUS;
        let max_cx = close_cx - BTN_SPACING;
        let min_cx = max_cx - BTN_SPACING;

        let min_bg = if self.hovered == HoveredButton::Minimize {
            COLOR_GRAY_SURFACE
        } else {
            COLOR_GRAY_DARK
        };

        let max_bg = if self.hovered == HoveredButton::Maximize {
            COLOR_GRAY_SURFACE
        } else {
            COLOR_GRAY_DARK
        };

        let close_bg = if self.hovered == HoveredButton::Close {
            COLOR_GRAY_SURFACE
        } else {
            COLOR_GRAY_DARK
        };

        bg_batch.add_circle(min_cx, cy, BTN_RADIUS, min_bg);
        bg_batch.add_rect(min_cx - 4.5, cy - 0.75, 9.0, 1.5, COLOR_WHITE);

        bg_batch.add_circle(max_cx, cy, BTN_RADIUS, max_bg);
        bg_batch.add_rect(max_cx - 4.0, cy - 4.0, 8.0, 8.0, COLOR_WHITE);
        bg_batch.add_rect(max_cx - 2.5, cy - 2.5, 5.0, 5.0, max_bg);

        bg_batch.add_circle(close_cx, cy, BTN_RADIUS, close_bg);
        bg_batch.add_line(
            close_cx - 3.5,
            cy - 3.5,
            close_cx + 3.5,
            cy + 3.5,
            1.5,
            COLOR_WHITE,
        );
        bg_batch.add_line(
            close_cx - 3.5,
            cy + 3.5,
            close_cx + 3.5,
            cy - 3.5,
            1.5,
            COLOR_WHITE,
        );

        renderer.draw(device, queue, render_pass, screen_size, &bg_batch, None);

        let text_x = 18.0;
        let text_y = (HEADER_HEIGHT - self.title_text.height) * 0.5;
        let mut title_batch = UiBatch::new();
        title_batch.add_textured_rect(
            text_x,
            text_y,
            self.title_text.width,
            self.title_text.height,
            COLOR_WHITE,
            0.0,
            0.0,
            1.0,
            1.0,
        );

        renderer.draw(
            device,
            queue,
            render_pass,
            screen_size,
            &title_batch,
            Some(&self.title_text.bind_group),
        );
    }
}
