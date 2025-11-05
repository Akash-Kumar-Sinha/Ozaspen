package ws

import (
	"encoding/json"
	"fmt"
	"sticky_notes_service/internals/database"
	savestickynotes "sticky_notes_service/internals/handlers/SaveStickyNotes"
	"sticky_notes_service/internals/helpers"
	"sticky_notes_service/internals/models"
)

func LoadStickyNoteBlocksFromDB(stickyNoteID string, client *Client) (json.RawMessage, error) {
	stickyNoteUUID, err := helpers.ParseUuid(stickyNoteID)
	if err != nil {
		return nil, fmt.Errorf("invalid sticky note ID: %v", err)
	}

	if _, allowed, err := savestickynotes.CheckPermission(stickyNoteUUID, client.profileID); err != nil || !allowed {
		return nil, fmt.Errorf("permission check failed: %v", err)
	}

	var stickyNote models.StickyNote
	if err := database.DB.
		Preload("Content").
		First(&stickyNote, "id = ?", stickyNoteUUID).Error; err != nil {
		return nil, fmt.Errorf("error loading sticky note from DB: %v", err)
	}

	return stickyNote.Content.Blocks, nil
}
