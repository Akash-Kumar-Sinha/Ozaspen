package ws

import (
	"fmt"
	"sticky_notes_service/internals/database"
	savestickynotes "sticky_notes_service/internals/handlers/SaveStickyNotes"
	"sticky_notes_service/internals/helpers"
	"sticky_notes_service/internals/models"

	"github.com/google/uuid"
)

func SaveLinesToDb(stickyNoteID string, blocks []models.Line, profileID uuid.UUID) error {
	stickyNoteUUID, err := helpers.ParseUuid(stickyNoteID)
	if err != nil {
		return fmt.Errorf("invalid sticky note ID: %v", err)
	}

	allowed, _, err := savestickynotes.CheckPermission(stickyNoteUUID, profileID)
	if err != nil {
		return fmt.Errorf("permission check failed: %v", err)
	}
	if !allowed {
		return fmt.Errorf("user does not have permission to modify this sticky note")
	}

	var stickyNote models.StickyNote
	if err := database.DB.Preload("BlocksContent.Blocks").Where("id = ? ", stickyNoteUUID).First(&stickyNote).Error; err != nil {
		return fmt.Errorf("sticky note not found or user unauthorized: %v", err)
	}

	if stickyNote.BlocksContent == nil {

		newContent := models.BlocksContent{}
		if err := database.DB.Create(&newContent).Error; err != nil {
			return fmt.Errorf("failed to create content: %v", err)
		}

		for _, lineData := range blocks {
			line := models.Line{
				BlocksContentID: newContent.ID,
				Number:          lineData.Number,
				LineContent:     lineData.LineContent,
			}
			if err := database.DB.Create(&line).Error; err != nil {
				return fmt.Errorf("failed to create line %d: %v", lineData.Number, err)
			}
		}

		stickyNote.BlocksContentID = &newContent.ID
		if err := database.DB.Save(&stickyNote).Error; err != nil {
			return fmt.Errorf("failed to link content: %v", err)
		}
		return nil
	}

	for _, lineData := range blocks {
		var existingLine models.Line
		err = database.DB.Where("blocks_content_id = ? AND number = ?", stickyNote.BlocksContent.ID, lineData.Number).First(&existingLine).Error

		if err != nil {

			line := models.Line{
				BlocksContentID: stickyNote.BlocksContent.ID,
				Number:          lineData.Number,
				LineContent:     lineData.LineContent,
			}
			if err := database.DB.Create(&line).Error; err != nil {
				return fmt.Errorf("failed to create line %d: %v", lineData.Number, err)
			}
		} else {

			existingLine.LineContent = lineData.LineContent
			if err := database.DB.Save(&existingLine).Error; err != nil {
				return fmt.Errorf("failed to update line %d: %v", lineData.Number, err)
			}
		}
	}

	return nil
}
