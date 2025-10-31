package handlers

import (
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/helpers"
	"sticky_notes_service/internals/models"

	"github.com/gin-gonic/gin"
)

type changeTitleRequest struct {
	StickyNoteID    string `json:"sticky_note_id" binding:"required"`
	StickyNoteTitle string `json:"sticky_note_title" binding:"required"`
}

func ChangeStickyNoteTitle(c *gin.Context) {

	profileID := helpers.GetProfileID(c)

	var req changeTitleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
	}

	stickyNoteID, err := helpers.ParseUuid(req.StickyNoteID)
	if err != nil {
		c.JSON(
			400, gin.H{"error": "Invalid sticky note ID"},
		)
		return
	}

	var note models.StickyNote
	if err := database.DB.Where("id = ? AND owner_id = ?", stickyNoteID, profileID).First(&note).Error; err != nil {
		c.JSON(404, gin.H{"error": "Sticky note not found or not owned by user"})
		return
	}

	note.Title = req.StickyNoteTitle

	if err := database.DB.Save(&note).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to update sticky note title"})
		return
	}

	c.JSON(200, gin.H{
		"message": "Sticky note title updated successfully",
		"success": true,
		"Title":   note.Title,
	})
}
