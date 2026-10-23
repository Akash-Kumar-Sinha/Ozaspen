use super::get::theme;
use theme::Theme;

pub fn with_theme<R>(f: impl FnOnce(&Theme) -> R) -> R {
    f(theme())
}
