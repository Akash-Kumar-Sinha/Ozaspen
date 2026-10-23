use super::types::{HeaderUi, HoveredButton};
use cosmic_text::Weight;
use renderer::{GpuText, TextEngine, UiRenderer};

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
}
