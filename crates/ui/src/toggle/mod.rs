use bytemuck::{Pod, Zeroable};
use wgpu::util::DeviceExt;

const SHADER: &str = include_str!("toggle.wgsl");

/// Variant of the sidebar toggle button.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ToggleVariant {
    /// Open variant: sidebar is visible / expanded (left pane highlighted)
    Open,
    /// Close variant: sidebar is hidden / collapsed (left pane empty/collapsed)
    Close,
}

/// Interaction action fired by the sidebar toggle button.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ToggleAction {
    /// Toggle state changed
    Toggled(ToggleVariant),
    /// Sidebar opened
    Opened,
    /// Sidebar closed
    Closed,
}

#[repr(C)]
#[derive(Copy, Clone, Debug, Pod, Zeroable)]
pub struct ToggleUniforms {
    pub resolution: [f32; 2],
    pub center: [f32; 2],
    pub scale: f32,
    pub open: f32,
    pub time: f32,
    pub hover: f32,
    pub pressed: f32,
    pub _pad0: f32,
    pub _pad1: [f32; 2],
    pub _pad2: [f32; 2],
    pub _pad3: [f32; 2],
}

impl Default for ToggleUniforms {
    fn default() -> Self {
        Self {
            resolution: [800.0, 600.0],
            center: [400.0, 300.0],
            scale: 0.8,
            open: 0.0,
            time: 0.0,
            hover: 0.0,
            pressed: 0.0,
            _pad0: 0.0,
            _pad1: [0.0; 2],
            _pad2: [0.0; 2],
            _pad3: [0.0; 2],
        }
    }
}

/// A modern procedural WebGPU Sidebar Trigger / Toggle Button with Open and Close variants.
///
/// Features:
/// - Open and Close variants with smooth physics animation
/// - Signed Distance Field (SDF) rendered sidebar icon geometry in WGSL
/// - Standard OS cursor (no custom cursor)
/// - Hover illumination and tactile press feedback
pub struct Toggle {
    pipeline: wgpu::RenderPipeline,
    bind_group: wgpu::BindGroup,
    uniform_buffer: wgpu::Buffer,
    uniforms: ToggleUniforms,

    is_open: bool,
    open_progress: f32,
    open_velocity: f32,
    pressed: bool,

    anchor: [f32; 2],
    cursor: Option<[f32; 2]>,
    elapsed: f32,
}

impl Toggle {
    /// Creates a new sidebar Toggle button initialized in the [`ToggleVariant::Close`] variant.
    pub fn new(device: &wgpu::Device, format: wgpu::TextureFormat) -> Self {
        Self::new_with_variant(device, format, ToggleVariant::Close)
    }

    /// Creates a new sidebar Toggle button initialized in the [`ToggleVariant::Open`] variant.
    pub fn open(device: &wgpu::Device, format: wgpu::TextureFormat) -> Self {
        Self::new_with_variant(device, format, ToggleVariant::Open)
    }

    /// Creates a new sidebar Toggle button initialized in the [`ToggleVariant::Close`] variant.
    pub fn close(device: &wgpu::Device, format: wgpu::TextureFormat) -> Self {
        Self::new_with_variant(device, format, ToggleVariant::Close)
    }

    /// Creates a new sidebar Toggle button with an explicit initial [`ToggleVariant`].
    pub fn new_with_variant(
        device: &wgpu::Device,
        format: wgpu::TextureFormat,
        variant: ToggleVariant,
    ) -> Self {
        let is_open = variant == ToggleVariant::Open;
        let open_progress = if is_open { 1.0 } else { 0.0 };

        let uniforms = ToggleUniforms {
            open: open_progress,
            ..Default::default()
        };

        let uniform_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Toggle Uniform Buffer"),
            contents: bytemuck::bytes_of(&uniforms),
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        });

        let bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
            label: Some("Toggle Bind Group Layout"),
            entries: &[wgpu::BindGroupLayoutEntry {
                binding: 0,
                visibility: wgpu::ShaderStages::FRAGMENT,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Uniform,
                    has_dynamic_offset: false,
                    min_binding_size: None,
                },
                count: None,
            }],
        });

        let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("Toggle Bind Group"),
            layout: &bind_group_layout,
            entries: &[wgpu::BindGroupEntry {
                binding: 0,
                resource: uniform_buffer.as_entire_binding(),
            }],
        });

        let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
            label: Some("Toggle Pipeline Layout"),
            bind_group_layouts: &[Some(&bind_group_layout)],
            immediate_size: 0,
        });

        let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
            label: Some("Toggle Shader"),
            source: wgpu::ShaderSource::Wgsl(SHADER.into()),
        });

        let pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("Toggle Pipeline"),
            layout: Some(&pipeline_layout),
            vertex: wgpu::VertexState {
                module: &shader,
                entry_point: Some("vs_main"),
                buffers: &[],
                compilation_options: wgpu::PipelineCompilationOptions::default(),
            },
            fragment: Some(wgpu::FragmentState {
                module: &shader,
                entry_point: Some("fs_main"),
                targets: &[Some(wgpu::ColorTargetState {
                    format,
                    blend: Some(wgpu::BlendState::ALPHA_BLENDING),
                    write_mask: wgpu::ColorWrites::ALL,
                })],
                compilation_options: wgpu::PipelineCompilationOptions::default(),
            }),
            primitive: wgpu::PrimitiveState {
                topology: wgpu::PrimitiveTopology::TriangleList,
                strip_index_format: None,
                front_face: wgpu::FrontFace::Ccw,
                cull_mode: None,
                polygon_mode: wgpu::PolygonMode::Fill,
                unclipped_depth: false,
                conservative: false,
            },
            depth_stencil: None,
            multisample: wgpu::MultisampleState {
                count: 1,
                mask: !0,
                alpha_to_coverage_enabled: false,
            },
            multiview_mask: None,
            cache: None,
        });

        Self {
            pipeline,
            bind_group,
            uniform_buffer,
            uniforms,
            is_open,
            open_progress,
            open_velocity: 0.0,
            pressed: false,
            anchor: [400.0, 300.0],
            cursor: None,
            elapsed: 0.0,
        }
    }

    /// Returns the current variant.
    pub fn variant(&self) -> ToggleVariant {
        if self.is_open {
            ToggleVariant::Open
        } else {
            ToggleVariant::Close
        }
    }

    /// Returns true if currently in the Open variant.
    pub fn is_open(&self) -> bool {
        self.is_open
    }

    /// Sets the variant with smooth spring animation.
    pub fn set_variant(&mut self, variant: ToggleVariant) {
        self.is_open = variant == ToggleVariant::Open;
    }

    /// Sets the variant immediately without spring animation.
    pub fn set_variant_immediate(&mut self, variant: ToggleVariant) {
        self.is_open = variant == ToggleVariant::Open;
        self.open_progress = if self.is_open { 1.0 } else { 0.0 };
        self.open_velocity = 0.0;
        self.uniforms.open = self.open_progress;
    }

    /// Toggles between Open and Close variants.
    pub fn toggle(&mut self) -> ToggleVariant {
        self.is_open = !self.is_open;
        self.variant()
    }

    /// Resizes the viewport resolution and re-centers anchor if needed.
    pub fn resize(&mut self, width: u32, height: u32) {
        let width = width.max(1) as f32;
        let height = height.max(1) as f32;

        self.anchor = [width * 0.5, height * 0.5];
        self.uniforms.resolution = [width, height];
        self.uniforms.center = self.anchor;
    }

    /// Sets the screen position of the toggle button.
    pub fn set_anchor(&mut self, x: f32, y: f32) {
        self.anchor = [x, y];
        self.uniforms.center = self.anchor;
    }

    /// Sets the screen position of the toggle button.
    pub fn set_center(&mut self, x: f32, y: f32) {
        self.set_anchor(x, y);
    }

    /// Sets the scale of the toggle button (default is 1.0).
    pub fn set_scale(&mut self, scale: f32) {
        self.uniforms.scale = scale.max(0.01);
    }

    /// Updates cursor position for hover detection.
    pub fn pointer_move(&mut self, x: f32, y: f32) {
        self.cursor = Some([x, y]);
    }

    /// Clears cursor position when pointer leaves the window.
    pub fn pointer_leave(&mut self) {
        self.cursor = None;
        self.pressed = false;
    }

    /// Call on mouse press. Returns [`Some(ToggleAction)`] if clicked.
    pub fn pointer_press(&mut self) -> Option<ToggleAction> {
        self.pressed = true;

        let cursor = self.cursor?;
        if self.contains_point(cursor[0], cursor[1]) {
            self.is_open = !self.is_open;
            let action = if self.is_open {
                ToggleAction::Opened
            } else {
                ToggleAction::Closed
            };
            return Some(action);
        }

        None
    }

    /// Call on mouse release.
    pub fn pointer_release(&mut self) {
        self.pressed = false;
    }

    /// Checks if a 2D screen coordinate is inside the button bounding area.
    pub fn contains_point(&self, px: f32, py: f32) -> bool {
        let scale = self.uniforms.scale;
        let [cx, cy] = self.anchor;
        let half_size = 18.0 * scale;

        (px - cx).abs() <= half_size && (py - cy).abs() <= half_size
    }

    /// Returns whether the cursor is hovering over the button.
    pub fn is_hovered(&self) -> bool {
        self.uniforms.hover > 0.5
    }

    /// Returns whether the toggle spring animation is actively running.
    pub fn is_animating(&self) -> bool {
        let target = if self.is_open { 1.0 } else { 0.0 };
        (target - self.open_progress).abs() > 0.001 || self.open_velocity.abs() > 0.001
    }

    /// Updates spring animation physics and writes uniforms.
    pub fn update(&mut self, dt: f32, queue: &wgpu::Queue) {
        let dt = dt.clamp(0.0, 0.05);
        self.elapsed += dt;

        let target = if self.is_open { 1.0 } else { 0.0 };
        let substeps = ((dt / 0.004).ceil() as usize).clamp(1, 16);
        let step = dt / substeps as f32;

        for _ in 0..substeps {
            let acceleration = (target - self.open_progress) * 400.0 - self.open_velocity * 26.0;
            self.open_velocity += acceleration * step;
            self.open_progress += self.open_velocity * step;
        }

        if (target - self.open_progress).abs() < 0.0005 && self.open_velocity.abs() < 0.0005 {
            self.open_progress = target;
            self.open_velocity = 0.0;
        }

        let hovered = if let Some(cursor) = self.cursor {
            self.contains_point(cursor[0], cursor[1])
        } else {
            false
        };

        self.uniforms.hover = if hovered { 1.0 } else { 0.0 };
        self.uniforms.pressed = if self.pressed && hovered { 1.0 } else { 0.0 };
        self.uniforms.open = self.open_progress;
        self.uniforms.time = self.elapsed;

        queue.write_buffer(&self.uniform_buffer, 0, bytemuck::bytes_of(&self.uniforms));
    }

    /// Encodes rendering commands for the sidebar Toggle button.
    pub fn render<'a>(&'a self, render_pass: &mut wgpu::RenderPass<'a>) {
        render_pass.set_pipeline(&self.pipeline);
        render_pass.set_bind_group(0, &self.bind_group, &[]);
        render_pass.draw(0..3, 0..1);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_shader_syntax() {
        wgpu::naga::front::wgsl::parse_str(SHADER).expect("Failed to parse WGSL");
    }
}
