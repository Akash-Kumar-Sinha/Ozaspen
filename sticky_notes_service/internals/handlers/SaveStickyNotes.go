package handlers

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
	fmt.Printf("print the request %v", req)

	stickyNoteID, err := uuid.Parse(req.StickyNoteID)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid sticky note ID format"})
		return
	}

	var stickyNoteContent models.Content
	if err := database.DB.Joins("JOIN sticky_notes ON sticky_notes.content_id = contents.id").
		Where("sticky_notes.id = ? AND sticky_notes.owner_id = ?", stickyNoteID, profileID).
		First(&stickyNoteContent).Error; err != nil {
		c.JSON(404, gin.H{"error": "Sticky note not found or access denied"})
		return
	}

	stickyNoteContent.Blocks = datatypes.JSON(req.Blocks)

	if err := database.DB.Save(&stickyNoteContent).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to save sticky note content"})
		return
	}

	c.JSON(200, gin.H{
		"message": "Sticky note content updated successfully",
		"blocks":  stickyNoteContent.Blocks,
	})
}
