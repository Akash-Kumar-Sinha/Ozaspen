package handlers

import (
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CreateNewStickyNoteRequest struct {
	NoteColors string `json:"note_colors" binding:"required"`
}

func CreateNewStickyNote(c *gin.Context) {

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

	var req CreateNewStickyNoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	stickyNotes := models.StickyNote{
		OwnerID:    profileID,
		NoteColors: req.NoteColors,
	}

	if err := database.DB.Create(&stickyNotes).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to create sticky note"})
		return
	}

	c.JSON(200, gin.H{
		"message":     "Sticky note created successfully",
		"success":     true,
		"sticky_note": stickyNotes,
	})

}
