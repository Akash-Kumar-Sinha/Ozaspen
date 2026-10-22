use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};

use uuid::Uuid;

use crate::adapter::{StorageAdapter, StorageError, validate_key};

const DOCUMENT_EXTENSION: &str = "json";

/// Stores versioned documents as individual JSON files under a workspace root.
#[derive(Debug, Clone)]
pub struct FilesystemStorage {
    root: PathBuf,
}

impl FilesystemStorage {
    #[must_use]
    pub fn new(root: impl Into<PathBuf>) -> Self {
        Self { root: root.into() }
    }

    #[must_use]
    pub fn root(&self) -> &Path {
        &self.root
    }

    fn path_for(&self, key: &str) -> Result<PathBuf, StorageError> {
        validate_key(key)?;
        let path = self.root.join(format!("{key}.{DOCUMENT_EXTENSION}"));
        if !path.starts_with(&self.root) {
            return Err(StorageError::PathTraversal(path));
        }
        Ok(path)
    }
}

impl StorageAdapter for FilesystemStorage {
    fn read(&self, key: &str) -> Result<Option<Vec<u8>>, StorageError> {
        let path = self.path_for(key)?;
        match fs::read(&path) {
            Ok(data) => Ok(Some(data)),
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
            Err(error) => Err(error.into()),
        }
    }

    fn write(&self, key: &str, data: &[u8]) -> Result<(), StorageError> {
        let path = self.path_for(key)?;
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        atomic_write(&path, data)
    }

    fn delete(&self, key: &str) -> Result<(), StorageError> {
        let path = self.path_for(key)?;
        match fs::remove_file(&path) {
            Ok(()) => Ok(()),
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
            Err(error) => Err(error.into()),
        }
    }

    fn list_keys(&self) -> Result<Vec<String>, StorageError> {
        let entries = match fs::read_dir(&self.root) {
            Ok(entries) => entries,
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(Vec::new()),
            Err(error) => return Err(error.into()),
        };

        let mut keys = Vec::new();
        for entry in entries {
            let entry = entry?;
            if !entry.file_type()?.is_file() {
                continue;
            }

            let path = entry.path();
            if path.extension().and_then(|ext| ext.to_str()) != Some(DOCUMENT_EXTENSION) {
                continue;
            }
            let Some(stem) = path.file_stem().and_then(|stem| stem.to_str()) else {
                continue;
            };
            // Temporary files written by `atomic_write` are never valid keys.
            if stem.starts_with('.') {
                continue;
            }
            keys.push(stem.to_owned());
        }

        keys.sort();
        Ok(keys)
    }
}

/// Writes to a sibling temporary file, flushes it to disk, and atomically
/// renames it over the destination. An interrupted write can never truncate the
/// previous document.
fn atomic_write(path: &Path, data: &[u8]) -> Result<(), StorageError> {
    let parent = path.parent().ok_or_else(|| {
        StorageError::Io(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "target path has no parent directory",
        ))
    })?;

    let temp_path = parent.join(format!(".tmp-{}", Uuid::new_v4()));
    let result = (|| -> Result<(), StorageError> {
        let mut file = fs::File::create(&temp_path)?;
        file.write_all(data)?;
        file.sync_all()?;
        drop(file);
        fs::rename(&temp_path, path)?;
        Ok(())
    })();

    if result.is_err() {
        let _ = fs::remove_file(&temp_path);
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_root() -> PathBuf {
        std::env::temp_dir().join(format!("ozaspen-storage-test-{}", Uuid::new_v4()))
    }

    #[test]
    fn writes_reads_lists_and_deletes() {
        let root = temp_root();
        let storage = FilesystemStorage::new(&root);

        assert_eq!(storage.read("notes").expect("read missing"), None);
        storage.write("notes", b"hello").expect("write");
        storage.write("other", b"world").expect("write");

        assert_eq!(
            storage.read("notes").expect("read"),
            Some(b"hello".to_vec())
        );
        assert_eq!(
            storage.list_keys().expect("list"),
            vec!["notes".to_owned(), "other".to_owned()]
        );

        storage.delete("notes").expect("delete");
        assert_eq!(storage.read("notes").expect("read deleted"), None);
        storage.delete("notes").expect("delete is idempotent");

        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn overwrites_preserve_the_previous_document_until_complete() {
        let root = temp_root();
        let storage = FilesystemStorage::new(&root);
        storage.write("notes", b"first").expect("write");
        storage.write("notes", b"second").expect("overwrite");
        assert_eq!(
            storage.read("notes").expect("read"),
            Some(b"second".to_vec())
        );
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn rejects_path_traversal_and_multi_component_keys() {
        let storage = FilesystemStorage::new(temp_root());
        for key in ["../escape", "nested/notes", "/absolute", ".", ".."] {
            assert!(
                matches!(storage.read(key), Err(StorageError::PathTraversal(_))),
                "key {key:?} should be rejected"
            );
        }
        assert!(matches!(
            storage.write("", b"x"),
            Err(StorageError::InvalidKey(_))
        ));
    }

    #[test]
    fn reports_write_failures_without_leaving_temporary_files() {
        let root = temp_root();
        let blocker = root.join("blocker");
        fs::create_dir_all(&root).expect("create parent");
        fs::write(&blocker, b"not a directory").expect("create blocker");

        // The root is a regular file, so creating the workspace directory fails.
        let storage = FilesystemStorage::new(&blocker);
        let error = storage
            .write("notes", b"data")
            .expect_err("write must fail");
        assert!(matches!(error, StorageError::Io(_)));

        let _ = fs::remove_dir_all(root);
    }
}
