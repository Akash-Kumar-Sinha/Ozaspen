package handlers

import (
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/helpers"
	"sticky_notes_service/internals/models"

	"github.com/gin-gonic/gin"
)

type CreateNewStickyNoteRequest struct {
	NoteColors string `json:"note_colors" binding:"required"`
}

func CreateNewStickyNote(c *gin.Context) {

	profileID := helpers.GetProfileID(c)

	var req CreateNewStickyNoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	content := models.Content{
		Blocks:  []byte("{}"),
		Changes: models.ChangesList{},
	}

	if err := database.DB.Create(&content).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to create sticky note content"})
		return
	}

	stickyNotes := models.StickyNote{
		OwnerID:    profileID,
		NoteColors: req.NoteColors,
		ContentID:  &content.ID,
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
