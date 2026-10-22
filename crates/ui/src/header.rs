use cosmic_text::Weight;
use renderer::{GpuText, TextEngine, UiBatch, UiRenderer};
use theme::{COLOR_GRAY_DARK, COLOR_GRAY_SURFACE, COLOR_NEAR_BLACK, COLOR_WHITE};

pub const HEADER_HEIGHT: f32 = 42.0;
const BTN_RADIUS: f32 = 12.0;
const BTN_SPACING: f32 = 40.0;

#[derive(Copy, Clone, Debug, PartialEq, Eq, Default)]
pub enum HoveredButton {
    #[default]
    None,
    Minimize,
    Maximize,
    Close,
}

pub enum HeaderAction {
    None,
    Minimize,
    Maximize,
    Close,
    Drag,
}

pub struct HeaderUi {
    title_text: GpuText,
    pub hovered: HoveredButton,
}

impl HeaderUi {
    pub fn new(
        device: &wgpu::Device,
        queue: &wgpu::Queue,
        renderer: &UiRenderer,
        engine: &mut TextEngine,
    ) -> Self {
        let title_img = engine.rasterize("Ozaspen", 15.0, Weight::SEMIBOLD);
        let title_text = GpuText::new(device, queue, renderer, &title_img);

        Self {
            title_text,
            hovered: HoveredButton::None,
        }
    }

    pub fn update_hover(&mut self, x: f32, y: f32, width: f32) -> bool {
        let previous = self.hovered;

        if y < 0.0 || y > HEADER_HEIGHT {
            self.hovered = HoveredButton::None;
            return previous != self.hovered;
        }

        let cy = HEADER_HEIGHT * 0.5;
        let close_cx = width - 16.0 - BTN_RADIUS;
        let max_cx = close_cx - BTN_SPACING;
        let min_cx = max_cx - BTN_SPACING;

        let hit = |cx: f32| -> bool {
            let dx = x - cx;
            let dy = y - cy;
            dx.abs() <= BTN_RADIUS + 4.0 && dy.abs() <= BTN_RADIUS + 4.0
        };

        self.hovered = if hit(close_cx) {
            HoveredButton::Close
        } else if hit(max_cx) {
            HoveredButton::Maximize
        } else if hit(min_cx) {
            HoveredButton::Minimize
        } else {
            HoveredButton::None
        };

        previous != self.hovered
    }

    pub fn clear_hover(&mut self) -> bool {
        let previous = self.hovered;
        self.hovered = HoveredButton::None;
        previous != self.hovered
    }

    pub fn handle_click(&self, x: f32, y: f32, width: f32) -> HeaderAction {
        if y < 0.0 || y > HEADER_HEIGHT {
            return HeaderAction::None;
        }

        let cy = HEADER_HEIGHT * 0.5;
        let close_cx = width - 16.0 - BTN_RADIUS;
        let max_cx = close_cx - BTN_SPACING;
        let min_cx = max_cx - BTN_SPACING;

        let hit = |cx: f32| -> bool {
            let dx = x - cx;
            let dy = y - cy;
            dx.abs() <= BTN_RADIUS + 4.0 && dy.abs() <= BTN_RADIUS + 4.0
        };

        if hit(close_cx) {
            HeaderAction::Close
        } else if hit(max_cx) {
            HeaderAction::Maximize
        } else if hit(min_cx) {
            HeaderAction::Minimize
        } else {
            HeaderAction::Drag
        }
    }

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
