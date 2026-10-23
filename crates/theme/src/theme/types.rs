#[derive(Clone, Debug, PartialEq)]
pub struct Theme {
    pub name: String,
    pub background: [f32; 4],
    pub foreground: [f32; 4],
    pub surface: [f32; 4],
    pub surface_raised: [f32; 4],
    pub header_background: [f32; 4],
    pub sidebar_background: [f32; 4],
    pub text_primary: [f32; 4],
    pub text_secondary: [f32; 4],
    pub text_muted: [f32; 4],
    pub accent: [f32; 4],
    pub accent_hover: [f32; 4],
    pub selection_background: [f32; 4],
    pub hover_background: [f32; 4],
    pub cursor: [f32; 4],
    pub red: [f32; 4],
    pub green: [f32; 4],
    pub yellow: [f32; 4],
    pub blue: [f32; 4],
    pub amber: [f32; 4],
    pub white: [f32; 4],
    pub black: [f32; 4],
}

impl Default for Theme {
    fn default() -> Self {
        Self::dark()
    }
}
