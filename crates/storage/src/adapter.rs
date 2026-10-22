use std::path::{Component, Path, PathBuf};

use thiserror::Error;

#[derive(Debug, Error)]
pub enum StorageError {
    #[error("storage I/O error: {0}")]
    Io(#[from] std::io::Error),

    #[error("invalid storage key: {0}")]
    InvalidKey(String),

    #[error("path traversal detected: {0}")]
    PathTraversal(PathBuf),

    #[error("storage is unavailable: {0}")]
    Unavailable(String),
}

/// Abstraction over local persistence.
///
/// Business logic depends on this trait instead of touching the filesystem
/// directly, which keeps the application testable and storage-agnostic.
pub trait StorageAdapter: Send + Sync {
    fn read(&self, key: &str) -> Result<Option<Vec<u8>>, StorageError>;

    fn write(&self, key: &str, data: &[u8]) -> Result<(), StorageError>;

    fn delete(&self, key: &str) -> Result<(), StorageError>;

    fn list_keys(&self) -> Result<Vec<String>, StorageError>;
}

/// Keys map to a single file name, so anything with separators, relative
/// components, or absolute prefixes is rejected before it reaches the disk.
pub(crate) fn validate_key(key: &str) -> Result<(), StorageError> {
    if key.is_empty() {
        return Err(StorageError::InvalidKey("key must not be empty".into()));
    }
    if key.len() > 128 {
        return Err(StorageError::InvalidKey(
            "key must be at most 128 bytes".into(),
        ));
    }

    let path = Path::new(key);
    let mut components = path.components();
    match (components.next(), components.next()) {
        (Some(Component::Normal(_)), None) => Ok(()),
        _ => Err(StorageError::PathTraversal(path.to_path_buf())),
    }
}
