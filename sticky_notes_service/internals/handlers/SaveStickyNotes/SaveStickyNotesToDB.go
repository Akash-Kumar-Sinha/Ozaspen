package savestickynotes

import (
	"fmt"
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/helpers"
	"sticky_notes_service/internals/models"

	"github.com/google/uuid"
)

func SaveStickyNotesToDB(req SaveStickyNotesRequest, profileID uuid.UUID) error {
	stickyNoteID, err := helpers.ParseUuid(req.StickyNoteID)
	if err != nil {
		return fmt.Errorf("invalid sticky note ID: %v", err)
	}

	allowed, _, err := CheckPermission(stickyNoteID, profileID)
	if err != nil {
		return fmt.Errorf("permission check failed: %v", err)
	}
	if !allowed {
		return fmt.Errorf("user does not have permission to modify this sticky note")
	}

	var stickyNote models.StickyNote
	if err := database.DB.Preload("BlocksContent").Where("id = ? ", stickyNoteID).First(&stickyNote).Error; err != nil {
		return fmt.Errorf("sticky note not found or user unauthorized: %v", err)
	}

	if stickyNote.BlocksContent == nil {
		newContent := models.BlocksContent{
			BlocksContentDetails: req.Blocks,
		}
		if err := database.DB.Create(&newContent).Error; err != nil {
			return fmt.Errorf("failed to create content: %v", err)
		}

		stickyNote.BlocksContentID = &newContent.ID
		if err := database.DB.Save(&stickyNote).Error; err != nil {
			return fmt.Errorf("failed to link content: %v", err)
		}
		return nil
	}

	stickyNote.BlocksContent.BlocksContentDetails = req.Blocks
	if err := database.DB.Save(stickyNote.BlocksContent).Error; err != nil {
		return fmt.Errorf("failed to save content: %v", err)
	}

	return nil
}
