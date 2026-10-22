use thiserror::Error;

use ozaspen_content::ContentError;
use ozaspen_storage::StorageError;

#[derive(Debug, Error)]
pub enum NotesError {
    #[error(transparent)]
    Storage(#[from] StorageError),

    #[error(transparent)]
    Content(#[from] ContentError),

    #[error("note not found: {0}")]
    NoteNotFound(String),

    #[error("sticky notes could not be loaded: {reason}")]
    CorruptDocument {
        reason: String,
        backup: Option<String>,
    },
}

impl NotesError {
    #[must_use]
    pub fn backup_key(&self) -> Option<&str> {
        match self {
            Self::CorruptDocument { backup, .. } => backup.as_deref(),
            _ => None,
        }
    }
}
