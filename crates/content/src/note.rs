use std::fmt;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Default size of a newly created sticky note, in logical pixels.
pub const DEFAULT_NOTE_WIDTH: f32 = 340.0;
pub const DEFAULT_NOTE_HEIGHT: f32 = 280.0;

/// Smallest size a sticky note may be resized to, in logical pixels.
pub const MIN_NOTE_WIDTH: f32 = 260.0;
pub const MIN_NOTE_HEIGHT: f32 = 180.0;

/// Stable identifier for a sticky note.
///
/// The identifier is generated once and persisted alongside the note so the
/// note can be reopened, moved, and updated across application restarts.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
#[serde(transparent)]
pub struct NoteId(String);

impl NoteId {
    /// Generates a new random, stable identifier.
    #[must_use]
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }

    /// Wraps an existing identifier, for example when reading a document.
    #[must_use]
    pub fn from_string(value: impl Into<String>) -> Self {
        Self(value.into())
    }

    #[must_use]
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl Default for NoteId {
    fn default() -> Self {
        Self::new()
    }
}

impl fmt::Display for NoteId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

/// Palette used by sticky notes.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum NoteColor {
    #[default]
    Yellow,
    Pink,
    Mint,
    Lavender,
    Sky,
    Peach,
}

impl NoteColor {
    pub const ALL: [Self; 6] = [
        Self::Yellow,
        Self::Pink,
        Self::Mint,
        Self::Lavender,
        Self::Sky,
        Self::Peach,
    ];

    /// Cycles through the palette so consecutive notes are visually distinct.
    #[must_use]
    pub fn at(index: usize) -> Self {
        Self::ALL[index % Self::ALL.len()]
    }

    /// RGB components used by the native UI.
    #[must_use]
    pub const fn rgb(self) -> [u8; 3] {
        match self {
            Self::Yellow => [0xfe, 0xf0, 0x8a],
            Self::Pink => [0xfb, 0xcf, 0xe8],
            Self::Mint => [0xbb, 0xf7, 0xd0],
            Self::Lavender => [0xe9, 0xd5, 0xff],
            Self::Sky => [0xba, 0xe6, 0xfd],
            Self::Peach => [0xfe, 0xd7, 0xaa],
        }
    }

    #[must_use]
    pub const fn label(self) -> &'static str {
        match self {
            Self::Yellow => "Yellow",
            Self::Pink => "Pink",
            Self::Mint => "Mint",
            Self::Lavender => "Lavender",
            Self::Sky => "Sky",
            Self::Peach => "Peach",
        }
    }
}

/// Position and size of a sticky note on the workspace canvas.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct NoteLayout {
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
    pub z_index: u32,
}

impl NoteLayout {
    #[must_use]
    pub fn new(x: f32, y: f32) -> Self {
        Self {
            x,
            y,
            width: DEFAULT_NOTE_WIDTH,
            height: DEFAULT_NOTE_HEIGHT,
            z_index: 1,
        }
    }

    /// Restores sane values for malformed or hand-edited documents.
    #[must_use]
    pub fn clamped(self) -> Self {
        Self {
            x: finite_or(self.x, 0.0),
            y: finite_or(self.y, 0.0),
            width: finite_or(self.width, DEFAULT_NOTE_WIDTH).max(MIN_NOTE_WIDTH),
            height: finite_or(self.height, DEFAULT_NOTE_HEIGHT).max(MIN_NOTE_HEIGHT),
            z_index: self.z_index,
        }
    }
}

impl Default for NoteLayout {
    fn default() -> Self {
        Self::new(0.0, 0.0)
    }
}

fn finite_or(value: f32, fallback: f32) -> f32 {
    if value.is_finite() { value } else { fallback }
}

/// A single sticky note.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct StickyNote {
    pub id: NoteId,
    pub title: String,
    pub body: String,
    pub color: NoteColor,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub layout: NoteLayout,
}

impl StickyNote {
    #[must_use]
    pub fn new(
        title: impl Into<String>,
        body: impl Into<String>,
        color: NoteColor,
        layout: NoteLayout,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: NoteId::new(),
            title: title.into(),
            body: body.into(),
            color,
            created_at: now,
            updated_at: now,
            layout: layout.clamped(),
        }
    }

    /// Marks the note as modified, updating its last-updated timestamp.
    pub fn touch(&mut self) {
        self.updated_at = Utc::now();
    }

    /// Title suitable for display, falling back for untitled notes.
    #[must_use]
    pub fn display_title(&self) -> &str {
        let trimmed = self.title.trim();
        if trimmed.is_empty() {
            "Untitled"
        } else {
            trimmed
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ids_are_stable_strings() {
        let id = NoteId::new();
        assert!(!id.as_str().is_empty());
        let round_tripped: NoteId =
            serde_json::from_str(&serde_json::to_string(&id).expect("serialize"))
                .expect("deserialize");
        assert_eq!(id, round_tripped);
    }

    #[test]
    fn layout_clamps_invalid_values() {
        let layout = NoteLayout {
            x: f32::NAN,
            y: f32::INFINITY,
            width: 1.0,
            height: -5.0,
            z_index: 7,
        }
        .clamped();

        assert_eq!(layout.x, 0.0);
        assert_eq!(layout.y, 0.0);
        assert_eq!(layout.width, MIN_NOTE_WIDTH);
        assert_eq!(layout.height, MIN_NOTE_HEIGHT);
        assert_eq!(layout.z_index, 7);
    }

    #[test]
    fn untitled_notes_have_a_fallback_title() {
        let note = StickyNote::new("   ", "", NoteColor::Yellow, NoteLayout::default());
        assert_eq!(note.display_title(), "Untitled");
    }
}
