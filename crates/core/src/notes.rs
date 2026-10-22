use chrono::Utc;
use ozaspen_content::{NoteColor, NoteId, NoteLayout, NotesDocument, StickyNote};
use ozaspen_storage::StorageAdapter;

use crate::NotesError;

/// Storage key of the single sticky-notes document.
pub const NOTES_DOCUMENT_KEY: &str = "sticky-notes";

/// Prefix used when preserving a corrupt document before the user continues.
pub const CORRUPT_BACKUP_PREFIX: &str = "sticky-notes.corrupt";

/// Owns the note document and its persistence.
///
/// The UI never talks to the filesystem directly: it mutates notes through this
/// service, then asks it to save. A failed save keeps the in-memory document
/// (and its dirty flag) intact, so no edits are lost.
pub struct NotesService {
    storage: Box<dyn StorageAdapter>,
    notes: Vec<StickyNote>,
    dirty: bool,
}

impl NotesService {
    #[must_use]
    pub fn new(storage: Box<dyn StorageAdapter>) -> Self {
        Self {
            storage,
            notes: Vec::new(),
            dirty: false,
        }
    }

    /// Loads the document from storage.
    ///
    /// A missing document is treated as an empty workspace. A corrupt document
    /// is copied to a timestamped backup key before an error is returned, so
    /// the raw user data is never discarded.
    pub fn load(&mut self) -> Result<(), NotesError> {
        let Some(bytes) = self.storage.read(NOTES_DOCUMENT_KEY)? else {
            self.notes.clear();
            self.dirty = false;
            return Ok(());
        };

        match NotesDocument::from_bytes(&bytes) {
            Ok(document) => {
                self.notes = document.notes;
                self.dirty = false;
                Ok(())
            }
            Err(error) => {
                let backup_key = format!("{CORRUPT_BACKUP_PREFIX}-{}", Utc::now().timestamp());
                match self.storage.write(&backup_key, &bytes) {
                    Ok(()) => Err(NotesError::CorruptDocument {
                        reason: error.to_string(),
                        backup: Some(backup_key),
                    }),
                    Err(backup_error) => Err(NotesError::CorruptDocument {
                        reason: format!("{error}; backup failed: {backup_error}"),
                        backup: None,
                    }),
                }
            }
        }
    }

    #[must_use]
    pub fn notes(&self) -> &[StickyNote] {
        &self.notes
    }

    #[must_use]
    pub fn note(&self, id: &NoteId) -> Option<&StickyNote> {
        self.notes.iter().find(|note| &note.id == id)
    }

    #[must_use]
    pub fn is_dirty(&self) -> bool {
        self.dirty
    }

    /// Creates a note with a fresh ID and timestamps. The note is placed on top
    /// of all existing notes and uses the next colour in the palette.
    pub fn create_note(&mut self, layout: NoteLayout) -> NoteId {
        let color = NoteColor::at(self.notes.len());
        let mut note = StickyNote::new("", "", color, layout.clamped());
        note.layout.z_index = self.next_z_index();

        let id = note.id.clone();
        self.notes.push(note);
        self.dirty = true;
        id
    }

    /// Updates the editable text of a note. Returns whether anything changed.
    pub fn update_text(&mut self, id: &NoteId, title: &str, body: &str) -> bool {
        let Some(note) = self.notes.iter_mut().find(|note| &note.id == id) else {
            return false;
        };

        if note.title == title && note.body == body {
            return false;
        }

        note.title.clear();
        note.title.push_str(title);
        note.body.clear();
        note.body.push_str(body);
        note.touch();
        self.dirty = true;
        true
    }

    /// Updates the position, size, or stacking order of a note.
    pub fn update_layout(&mut self, id: &NoteId, layout: NoteLayout) -> bool {
        let Some(note) = self.notes.iter_mut().find(|note| &note.id == id) else {
            return false;
        };

        let layout = layout.clamped();
        if note.layout == layout {
            return false;
        }

        note.layout = layout;
        note.touch();
        self.dirty = true;
        true
    }

    /// Raises a note above the others.
    pub fn bring_to_front(&mut self, id: &NoteId) -> bool {
        let Some(index) = self.notes.iter().position(|note| &note.id == id) else {
            return false;
        };
        let current = self.notes[index].layout.z_index;
        let topmost = self
            .notes
            .iter()
            .filter(|note| &note.id != id)
            .map(|note| note.layout.z_index)
            .max();

        if topmost.is_none_or(|topmost| current > topmost) {
            return false;
        }

        let next_z_index = self.next_z_index();
        let note = &mut self.notes[index];
        note.layout.z_index = next_z_index;
        note.touch();
        self.dirty = true;
        true
    }

    /// Applies a note received from a collaborator.
    ///
    /// Existing notes only accept an incoming version that is at least as new
    /// as the local one, so a delayed packet cannot overwrite newer edits.
    pub fn upsert_note(&mut self, note: StickyNote) -> bool {
        let mut note = note;
        note.layout = note.layout.clamped();

        if let Some(existing) = self
            .notes
            .iter_mut()
            .find(|existing| existing.id == note.id)
        {
            if note.updated_at < existing.updated_at || *existing == note {
                return false;
            }
            *existing = note;
        } else {
            self.notes.push(note);
        }

        self.dirty = true;
        true
    }

    pub fn delete_note(&mut self, id: &NoteId) -> bool {
        let previous_len = self.notes.len();
        self.notes.retain(|note| &note.id != id);
        if self.notes.len() == previous_len {
            return false;
        }

        self.dirty = true;
        true
    }

    /// Persists the current document. The dirty flag is only cleared after the
    /// write succeeds; on failure the in-memory document remains authoritative.
    pub fn save(&mut self) -> Result<(), NotesError> {
        let document = NotesDocument::new(self.notes.clone());
        let bytes = document.to_bytes()?;
        self.storage.write(NOTES_DOCUMENT_KEY, &bytes)?;
        self.dirty = false;
        Ok(())
    }

    fn next_z_index(&self) -> u32 {
        self.notes
            .iter()
            .map(|note| note.layout.z_index)
            .max()
            .unwrap_or(0)
            .saturating_add(1)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ozaspen_storage::MemoryStorage;

    fn service() -> (NotesService, MemoryStorage) {
        let storage = MemoryStorage::new();
        (NotesService::new(Box::new(storage.clone())), storage)
    }

    #[test]
    fn creates_updates_and_deletes_notes() {
        let (mut service, _storage) = service();
        let id = service.create_note(NoteLayout::new(10.0, 20.0));
        assert_eq!(service.notes().len(), 1);
        assert!(service.is_dirty());

        assert!(service.update_text(&id, "Hello", "Body"));
        let note = service.note(&id).expect("note exists");
        assert_eq!(note.title, "Hello");
        assert_eq!(note.body, "Body");

        let mut layout = note.layout;
        layout.x = 99.0;
        layout.width = 10.0;
        assert!(service.update_layout(&id, layout));
        assert_eq!(
            service.note(&id).expect("note exists").layout.width,
            ozaspen_content::MIN_NOTE_WIDTH
        );

        assert!(service.delete_note(&id));
        assert!(service.notes().is_empty());
    }

    #[test]
    fn failed_saves_keep_the_document_and_retry_cleanly() {
        let (mut service, storage) = service();
        let id = service.create_note(NoteLayout::new(4.0, 8.0));
        storage.set_fail_writes(true);

        assert!(service.save().is_err());
        assert!(service.is_dirty());
        assert!(service.note(&id).is_some());

        storage.set_fail_writes(false);
        service.save().expect("retry succeeds");
        assert!(!service.is_dirty());
    }

    #[test]
    fn persists_across_service_restarts() {
        let storage = MemoryStorage::new();
        let id = {
            let mut service = NotesService::new(Box::new(storage.clone()));
            let id = service.create_note(NoteLayout::new(32.0, 48.0));
            service.update_text(&id, "Persisted", "Survives a restart");
            service.save().expect("save");
            id
        };

        let mut reopened = NotesService::new(Box::new(storage));
        reopened.load().expect("load");
        let note = reopened.note(&id).expect("note was persisted");
        assert_eq!(note.title, "Persisted");
        assert_eq!(note.body, "Survives a restart");
        assert!(!reopened.is_dirty());
    }

    #[test]
    fn persists_notes_to_the_filesystem_across_restarts() {
        let root = std::env::temp_dir().join(format!(
            "ozaspen-core-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("system clock")
                .as_nanos()
        ));

        let id = {
            let storage = ozaspen_storage::FilesystemStorage::new(&root);
            let mut service = NotesService::new(Box::new(storage));
            let id = service.create_note(NoteLayout::new(20.0, 30.0));
            service.update_text(&id, "On disk", "Survives a real restart");
            service.save().expect("save to disk");
            id
        };

        {
            let storage = ozaspen_storage::FilesystemStorage::new(&root);
            let mut reopened = NotesService::new(Box::new(storage));
            reopened.load().expect("load from disk");
            let note = reopened.note(&id).expect("note was persisted on disk");
            assert_eq!(note.title, "On disk");
            assert_eq!(note.body, "Survives a real restart");
        }

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn corrupt_documents_are_backed_up_before_reporting_an_error() {
        let storage = MemoryStorage::new();
        storage
            .write(NOTES_DOCUMENT_KEY, b"{ this is not valid json")
            .expect("seed corrupt document");

        let mut service = NotesService::new(Box::new(storage.clone()));
        let error = service.load().expect_err("corrupt document must fail");
        let backup_key = error.backup_key().expect("backup key");

        assert_eq!(
            storage.read(backup_key).expect("read backup"),
            Some(b"{ this is not valid json".to_vec())
        );
        assert!(service.notes().is_empty());
    }
}
