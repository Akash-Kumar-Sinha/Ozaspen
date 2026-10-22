use theme::{COLOR_GRAY_MUTED, COLOR_NEAR_BLACK};
use winit::window::{CustomCursor, CustomCursorSource};

/// INFO: Converts linear float color [r, g, b, a] to 8-bit RGBA channel bytes.
const fn to_u8_rgba(c: [f32; 4]) -> [u8; 4] {
    [
        (c[0] * 255.0) as u8,
        (c[1] * 255.0) as u8,
        (c[2] * 255.0) as u8,
        (c[3] * 255.0) as u8,
    ]
}

/// INFO: Creates a custom pointer hand cursor source styled with rounded fingertips, COLOR_NEAR_BLACK fill, and COLOR_GRAY_MUTED border.
pub fn pointer_cursor() -> Result<CustomCursorSource, Box<dyn std::error::Error>> {
    let width = 20u16;
    let height = 20u16;
    let hotspot_x = 6u16;
    let hotspot_y = 1u16;

    let fill = to_u8_rgba(COLOR_NEAR_BLACK);
    let border = to_u8_rgba(COLOR_GRAY_MUTED);
    let transparent = [0u8, 0u8, 0u8, 0u8];

    // 20x20 slender pointer hand bitmap:
    // '#' = COLOR_NEAR_BLACK, 'O' = COLOR_GRAY_MUTED, '.' = transparent
    const HAND_PIXELS: [&str; 20] = [
        "......OO............",
        ".....O##O...........",
        ".....O##O...........",
        ".....O##O...........",
        ".....O##O..OO.......",
        ".....O##O.O##O..OO..",
        ".....O##OO###OO##O..",
        ".....O##O####O###O..",
        "..OO.O##O####O###O..",
        ".O##OO###########O..",
        "O###O############O..",
        "O################O..",
        ".O###############O..",
        "..O##############O..",
        "..O#############O...",
        "...O############O...",
        "....O###########O...",
        "....O##########O....",
        ".....OOOOOOOOOO.....",
        "....................",
    ];

    let mut rgba = Vec::with_capacity((width as usize) * (height as usize) * 4);
    for row in HAND_PIXELS {
        for ch in row.chars() {
            match ch {
                '#' => rgba.extend_from_slice(&fill),
                'O' => rgba.extend_from_slice(&border),
                _ => rgba.extend_from_slice(&transparent),
            }
        }
    }

    Ok(CustomCursor::from_rgba(rgba, width, height, hotspot_x, hotspot_y)?)
}
