use std::collections::BTreeMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex, MutexGuard};

use crate::adapter::{StorageAdapter, StorageError, validate_key};

/// In-memory adapter used by tests and by callers that need an ephemeral
/// workspace. Clones share the same backing store.
#[derive(Debug, Clone, Default)]
pub struct MemoryStorage {
    files: Arc<Mutex<BTreeMap<String, Vec<u8>>>>,
    fail_writes: Arc<AtomicBool>,
}

impl MemoryStorage {
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    /// Makes every subsequent write fail. Useful for exercising save-error
    /// handling without touching the filesystem.
    pub fn set_fail_writes(&self, fail: bool) {
        self.fail_writes.store(fail, Ordering::SeqCst);
    }

    fn files(&self) -> Result<MutexGuard<'_, BTreeMap<String, Vec<u8>>>, StorageError> {
        self.files
            .lock()
            .map_err(|_| StorageError::Unavailable("in-memory store lock was poisoned".into()))
    }
}

impl StorageAdapter for MemoryStorage {
    fn read(&self, key: &str) -> Result<Option<Vec<u8>>, StorageError> {
        validate_key(key)?;
        Ok(self.files()?.get(key).cloned())
    }

    fn write(&self, key: &str, data: &[u8]) -> Result<(), StorageError> {
        validate_key(key)?;
        if self.fail_writes.load(Ordering::SeqCst) {
            return Err(StorageError::Unavailable(
                "simulated write failure".to_owned(),
            ));
        }
        self.files()?.insert(key.to_owned(), data.to_vec());
        Ok(())
    }

    fn delete(&self, key: &str) -> Result<(), StorageError> {
        validate_key(key)?;
        self.files()?.remove(key);
        Ok(())
    }

    fn list_keys(&self) -> Result<Vec<String>, StorageError> {
        Ok(self.files()?.keys().cloned().collect())
    }
}
