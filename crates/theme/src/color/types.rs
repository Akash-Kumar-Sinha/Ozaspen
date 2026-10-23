// INFO: Terminal color representation supporting standard defaults, 256 indexed colors, and 24-bit truecolor.
#[derive(Clone, Copy, PartialEq, Eq, Debug, Default, Hash)]
pub enum Color {
    #[default]
    Default,
    Indexed(u8),
    Rgb(u8, u8, u8),
}
