use serde::{Deserialize, Serialize};

use crate::{ContentError, StickyNote};

/// Current on-disk format version. Bump this when the note schema changes in a
/// way that requires migration before loading.
pub const CURRENT_FORMAT_VERSION: u32 = 1;

/// Versioned document envelope persisted by the local storage adapter.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct NotesDocument {
    pub format_version: u32,
    pub notes: Vec<StickyNote>,
}

impl NotesDocument {
    #[must_use]
    pub fn new(notes: Vec<StickyNote>) -> Self {
        Self {
            format_version: CURRENT_FORMAT_VERSION,
            notes,
        }
    }

    /// Serializes the document to pretty-printed JSON so the workspace remains
    /// human-readable and easy to recover manually.
    pub fn to_bytes(&self) -> Result<Vec<u8>, ContentError> {
        serde_json::to_vec_pretty(self).map_err(|error| ContentError::Encode(error.to_string()))
    }

    /// Parses a document and verifies that this build understands its format.
    pub fn from_bytes(bytes: &[u8]) -> Result<Self, ContentError> {
        let document: Self = serde_json::from_slice(bytes)
            .map_err(|error| ContentError::Decode(error.to_string()))?;

        if document.format_version != CURRENT_FORMAT_VERSION {
            return Err(ContentError::UnsupportedVersion {
                found: document.format_version,
                supported: CURRENT_FORMAT_VERSION,
            });
        }

        Ok(document)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{NoteColor, NoteLayout};

    fn sample_note() -> StickyNote {
        StickyNote::new(
            "Ideas",
            "A first line\nand a second line",
            NoteColor::Mint,
            NoteLayout::new(12.0, 24.0),
        )
    }

    #[test]
    fn round_trips_through_json() {
        let document = NotesDocument::new(vec![sample_note()]);
        let bytes = document.to_bytes().expect("encode");
        let decoded = NotesDocument::from_bytes(&bytes).expect("decode");
        assert_eq!(document, decoded);
    }

    #[test]
    fn rejects_unknown_future_versions() {
        let document = NotesDocument::new(Vec::new());
        let mut value = serde_json::to_value(&document).expect("to value");
        value["format_version"] = serde_json::json!(CURRENT_FORMAT_VERSION + 1);
        let bytes = serde_json::to_vec(&value).expect("to bytes");

        let error = NotesDocument::from_bytes(&bytes).expect_err("version must be rejected");
        assert!(matches!(
            error,
            ContentError::UnsupportedVersion { found, supported }
                if found == CURRENT_FORMAT_VERSION + 1 && supported == CURRENT_FORMAT_VERSION
        ));
    }

    #[test]
    fn malformed_documents_return_a_decode_error() {
        assert!(matches!(
            NotesDocument::from_bytes(b"not json"),
            Err(ContentError::Decode(_))
        ));
    }
}
