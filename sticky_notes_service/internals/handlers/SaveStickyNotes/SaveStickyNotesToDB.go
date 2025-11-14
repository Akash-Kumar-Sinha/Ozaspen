package savestickynotes

import (
	"encoding/json"
	"fmt"
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/helpers"
	"sticky_notes_service/internals/models"

	"github.com/google/uuid"
	"gorm.io/datatypes"
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
	if err := database.DB.Preload("BlocksContent.Blocks").Where("id = ? ", stickyNoteID).First(&stickyNote).Error; err != nil {
		return fmt.Errorf("sticky note not found or user unauthorized: %v", err)
	}

	if stickyNote.BlocksContent == nil {
		// Create new content structure
		newContent := models.BlocksContent{}
		if err := database.DB.Create(&newContent).Error; err != nil {
			return fmt.Errorf("failed to create content: %v", err)
		}

		// Create lines for each block
		for i, block := range req.Blocks {
			// Convert the raw JSON block to datatypes.JSON
			blockJSON, err := json.Marshal(block)
			if err != nil {
				return fmt.Errorf("failed to marshal block %d: %v", i+1, err)
			}

			line := models.Line{
				BlocksContentID: newContent.ID,
				Number:          i + 1,
				LineContent:     datatypes.JSON(blockJSON),
			}
			if err := database.DB.Create(&line).Error; err != nil {
				return fmt.Errorf("failed to create line %d: %v", i+1, err)
			}
		}

		stickyNote.BlocksContentID = &newContent.ID
		if err := database.DB.Save(&stickyNote).Error; err != nil {
			return fmt.Errorf("failed to link content: %v", err)
		}
		return nil
	}

	// Delete existing lines and recreate them
	if err := database.DB.Where("blocks_content_id = ?", stickyNote.BlocksContent.ID).Delete(&models.Line{}).Error; err != nil {
		return fmt.Errorf("failed to delete existing lines: %v", err)
	}

	// Create new lines for each block
	for i, block := range req.Blocks {
		// Convert the raw JSON block to datatypes.JSON
		blockJSON, err := json.Marshal(block)
		if err != nil {
			return fmt.Errorf("failed to marshal block %d: %v", i+1, err)
		}

		line := models.Line{
			BlocksContentID: stickyNote.BlocksContent.ID,
			Number:          i + 1,
			LineContent:     datatypes.JSON(blockJSON),
		}
		if err := database.DB.Create(&line).Error; err != nil {
			return fmt.Errorf("failed to create line %d: %v", i+1, err)
		}
	}

	return nil
}
