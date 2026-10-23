use super::state::THEME;
use theme::Theme;

pub fn theme() -> &'static Theme {
    THEME.get_or_init(Theme::dark)
}
