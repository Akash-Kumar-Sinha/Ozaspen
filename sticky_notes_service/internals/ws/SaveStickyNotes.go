package ws

import (
	"fmt"
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type SaveStickyNotesRequest struct {
	StickyNoteID string         `json:"sticky_note_id" binding:"required"`
	Blocks       datatypes.JSON `json:"blocks" binding:"required"`
}

func SaveStickyNotes(c *gin.Context) {
	profileIDStr, exists := c.Get("profileID")
	if !exists {
		c.JSON(500, gin.H{"error": "Profile ID not found in context"})
		return
	}

	profileID, err := uuid.Parse(profileIDStr.(string))
	if err != nil {
		c.JSON(500, gin.H{"error": "Invalid profile ID format"})
		return
	}

	var req SaveStickyNotesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if err := SaveStickyNotesToDB(req, profileID); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "Sticky notes saved successfully"})

}

func SaveStickyNotesToDB(req SaveStickyNotesRequest, profileID uuid.UUID) error {
	stickyNoteID, err := uuid.Parse(req.StickyNoteID)
	if err != nil {
		return fmt.Errorf("invalid sticky note ID: %v", err)
	}

	// Check permission to write to this sticky note
	// ---- Need to write code ----

	var stickyNote models.StickyNote
	if err := database.DB.Preload("Content").Where("id = ? AND owner_id = ?", stickyNoteID, profileID).First(&stickyNote).Error; err != nil {
		return fmt.Errorf("sticky note not found or user unauthorized: %v", err)
	}

	if stickyNote.Content == nil {
		newContent := models.Content{
			Blocks: datatypes.JSON(req.Blocks),
		}
		if err := database.DB.Create(&newContent).Error; err != nil {
			return fmt.Errorf("failed to create content: %v", err)
		}

		stickyNote.ContentID = &newContent.ID
		if err := database.DB.Save(&stickyNote).Error; err != nil {
			return fmt.Errorf("failed to link content: %v", err)
		}
		return nil
	}

	stickyNote.Content.Blocks = datatypes.JSON(req.Blocks)
	if err := database.DB.Save(stickyNote.Content).Error; err != nil {
		return fmt.Errorf("failed to save content: %v", err)
	}

	return nil
}
