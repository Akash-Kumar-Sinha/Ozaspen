use cosmic_text::{Attrs, Buffer, Family, FontSystem, Metrics, Shaping, SwashCache, Weight};
use wgpu::util::DeviceExt;

pub struct TextImage {
    pub width: u32,
    pub height: u32,
    pub data: Vec<u8>,
}

pub struct TextEngine {
    font_system: FontSystem,
    swash_cache: SwashCache,
}

impl Default for TextEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl TextEngine {
    pub fn new() -> Self {
        Self {
            font_system: FontSystem::new(),
            swash_cache: SwashCache::new(),
        }
    }

    pub fn rasterize(&mut self, text: &str, font_size: f32, weight: Weight) -> TextImage {
        let line_height = font_size * 1.3;
        let mut buffer = Buffer::new(&mut self.font_system, Metrics::new(font_size, line_height));
        let attrs = Attrs::new().family(Family::SansSerif).weight(weight);
        buffer.set_text(text, &attrs, Shaping::Advanced, None);
        buffer.shape_until_scroll(&mut self.font_system, false);

        let mut min_x = i32::MAX;
        let mut min_y = i32::MAX;
        let mut max_x = i32::MIN;
        let mut max_y = i32::MIN;

        struct GlyphRender {
            x: i32,
            y: i32,
            w: u32,
            h: u32,
            data: Vec<u8>,
        }

        let mut glyphs_to_render = Vec::new();

        for run in buffer.layout_runs() {
            let line_y = run.line_y;
            for glyph in run.glyphs.iter() {
                let physical = glyph.physical((0.0, line_y), 1.0);
                if let Some(image) = self
                    .swash_cache
                    .get_image_uncached(&mut self.font_system, physical.cache_key)
                {
                    let gx = physical.x + image.placement.left;
                    let gy = physical.y - image.placement.top;
                    let gw = image.placement.width;
                    let gh = image.placement.height;

                    if gw > 0 && gh > 0 {
                        min_x = min_x.min(gx);
                        min_y = min_y.min(gy);
                        max_x = max_x.max(gx + gw as i32);
                        max_y = max_y.max(gy + gh as i32);

                        glyphs_to_render.push(GlyphRender {
                            x: gx,
                            y: gy,
                            w: gw,
                            h: gh,
                            data: image.data,
                        });
                    }
                }
            }
        }

        if glyphs_to_render.is_empty() || max_x <= min_x || max_y <= min_y {
            return TextImage {
                width: 1,
                height: 1,
                data: vec![0],
            };
        }

        let total_w = (max_x - min_x) as u32;
        let total_h = (max_y - min_y) as u32;
        let mut atlas_data = vec![0u8; (total_w * total_h) as usize];

        for g in glyphs_to_render {
            let ox = (g.x - min_x) as usize;
            let oy = (g.y - min_y) as usize;
            for row in 0..g.h as usize {
                for col in 0..g.w as usize {
                    let src_idx = row * g.w as usize + col;
                    let dst_idx = (oy + row) * total_w as usize + (ox + col);
                    if src_idx < g.data.len() && dst_idx < atlas_data.len() {
                        let alpha = g.data[src_idx];
                        atlas_data[dst_idx] = atlas_data[dst_idx].max(alpha);
                    }
                }
            }
        }

        TextImage {
            width: total_w,
            height: total_h,
            data: atlas_data,
        }
    }
}

pub struct GpuText {
    pub bind_group: wgpu::BindGroup,
    pub width: f32,
    pub height: f32,
}

impl GpuText {
    pub fn new(
        device: &wgpu::Device,
        queue: &wgpu::Queue,
        renderer: &crate::render::UiRenderer,
        image: &TextImage,
    ) -> Self {
        let width = image.width.max(1);
        let height = image.height.max(1);

        let texture = device.create_texture_with_data(
            queue,
            &wgpu::TextureDescriptor {
                label: Some("Text Atlas Texture"),
                size: wgpu::Extent3d {
                    width,
                    height,
                    depth_or_array_layers: 1,
                },
                mip_level_count: 1,
                sample_count: 1,
                dimension: wgpu::TextureDimension::D2,
                format: wgpu::TextureFormat::R8Unorm,
                usage: wgpu::TextureUsages::TEXTURE_BINDING,
                view_formats: &[],
            },
            wgpu::util::TextureDataOrder::LayerMajor,
            &image.data,
        );

        let view = texture.create_view(&wgpu::TextureViewDescriptor::default());
        let bind_group = renderer.create_texture_bind_group(device, &view);

        Self {
            bind_group,
            width: width as f32,
            height: height as f32,
        }
    }
}
