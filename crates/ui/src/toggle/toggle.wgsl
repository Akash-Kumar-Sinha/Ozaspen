struct Uniforms {
    resolution: vec2<f32>,
    center: vec2<f32>,
    scale: f32,
    open: f32,
    time: f32,
    hover: f32,
    pressed: f32,
    _pad0: f32,
    _pad1: vec2<f32>,
    _pad2: vec2<f32>,
    _pad3: vec2<f32>,
};

@group(0) @binding(0) var<uniform> u: Uniforms;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var positions = array<vec2<f32>, 3>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(3.0, -1.0),
        vec2<f32>(-1.0, 3.0),
    );

    var out: VertexOutput;
    out.position = vec4<f32>(positions[vertex_index], 0.0, 1.0);
    return out;
}

fn srgb(color: vec3<f32>) -> vec3<f32> {
    return pow(max(color, vec3<f32>(0.0)), vec3<f32>(2.2));
}

fn sd_segment(point: vec2<f32>, a: vec2<f32>, b: vec2<f32>) -> f32 {
    let pa = point - a;
    let ba = b - a;
    let h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.000001), 0.0, 1.0);
    return length(pa - ba * h);
}

fn sd_box(point: vec2<f32>, half_size: vec2<f32>, radius: f32) -> f32 {
    let q = abs(point) - half_size + radius;
    return length(max(q, vec2<f32>(0.0))) + min(max(q.x, q.y), 0.0) - radius;
}

fn fill(distance: f32) -> f32 {
    return 1.0 - smoothstep(-0.75, 0.75, distance);
}

fn fill_icon(distance: f32) -> f32 {
    return 1.0 - smoothstep(-0.85, 0.85, distance);
}

fn over(dst: vec4<f32>, src: vec4<f32>) -> vec4<f32> {
    let alpha = src.a + dst.a * (1.0 - src.a);
    let rgb = (src.rgb * src.a + dst.rgb * dst.a * (1.0 - src.a)) / max(alpha, 0.00001);
    return vec4<f32>(rgb, alpha);
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    let point = in.position.xy;
    let scale = max(u.scale, 0.01);
    let center = u.center;

    let open = clamp(u.open, 0.0, 1.0);
    let hover = u.hover;
    let pressed = u.pressed;

    // Relative coordinates centered on button
    let local_p = (point - center) / scale;

    // Palette
    let zinc950 = srgb(vec3<f32>(0.035, 0.035, 0.043));
    let zinc900 = srgb(vec3<f32>(0.086, 0.086, 0.098));
    let zinc800 = srgb(vec3<f32>(0.153, 0.153, 0.165));
    let zinc700 = srgb(vec3<f32>(0.247, 0.247, 0.275));
    let zinc600 = srgb(vec3<f32>(0.320, 0.320, 0.355));
    let zinc500 = srgb(vec3<f32>(0.440, 0.440, 0.480));
    let zinc400 = srgb(vec3<f32>(0.630, 0.630, 0.670));
    let zinc300 = srgb(vec3<f32>(0.820, 0.820, 0.850));
    let white   = vec3<f32>(1.0, 1.0, 1.0);

    // Subtle emerald tint for active open state
    let emerald500 = srgb(vec3<f32>(0.063, 0.725, 0.506));
    let emerald400 = srgb(vec3<f32>(0.204, 0.827, 0.600));

    // Base canvas (transparent)
    var color = vec4<f32>(0.0, 0.0, 0.0, 0.0);

    // -------------------------------------------------------------
    // Sidebar Icon Geometry
    // -------------------------------------------------------------
    // Subtle press scale feedback on the icon
    let p_scaled = local_p / mix(1.0, 0.94, pressed);

    // Outer rounded box: half-size (11.0, 9.5), corner radius 3.5
    let icon_half = vec2<f32>(11.0, 9.5);
    let icon_radius = 3.5;
    let stroke_width = 1.35 * scale;

    let d_icon_box = sd_box(p_scaled, icon_half, icon_radius) * scale;

    // Outer frame stroke
    let d_outer_stroke = abs(d_icon_box) - (stroke_width * 0.5);

    // Vertical divider line x-coordinate:
    // In Open variant: divider is at x = -3.8 (sidebar ~35% open)
    // In Close variant: divider collapses to x = -8.5
    let div_x = mix(-8.5, -3.8, open);
    let d_divider = sd_segment(
        p_scaled,
        vec2<f32>(div_x, -icon_half.y + 1.2),
        vec2<f32>(div_x, icon_half.y - 1.2)
    ) * scale - (stroke_width * 0.5);

    // Combined icon outline
    let d_icon_lines = min(d_outer_stroke, d_divider);

    // -------------------------------------------------------------
    // 3. Left Sidebar Pane Fill (Open Variant Indicator)
    // -------------------------------------------------------------
    // When Open: left sidebar compartment is filled solid/tinted
    // When Close: left sidebar compartment is empty/transparent
    let left_w = max((div_x - (-icon_half.x) - 1.5) * 0.5, 0.01);
    let left_pane_center_x = (-icon_half.x + div_x) * 0.5;
    let d_left_pane = sd_box(
        p_scaled - vec2<f32>(left_pane_center_x, 0.0),
        vec2<f32>(left_w, icon_half.y - 1.5),
        2.0
    ) * scale;

    // Left pane fill color: white/zinc-300 with subtle glow in Open variant
    let left_fill_color = mix(zinc300, white, hover);
    let left_fill_alpha = smoothstep(0.2, 0.85, open) * 0.85;
    color = over(color, vec4<f32>(left_fill_color, fill(d_left_pane) * left_fill_alpha));

    // -------------------------------------------------------------
    // 4. Render Icon Outline
    // -------------------------------------------------------------
    let icon_color = mix(
        mix(zinc400, zinc300, hover),
        mix(white, emerald400, 0.25),
        open
    );
    color = over(color, vec4<f32>(icon_color, fill_icon(d_icon_lines)));

    return color;
}
