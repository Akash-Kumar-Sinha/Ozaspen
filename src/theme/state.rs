use std::sync::OnceLock;
use theme::Theme;

pub(crate) static THEME: OnceLock<Theme> = OnceLock::new();
