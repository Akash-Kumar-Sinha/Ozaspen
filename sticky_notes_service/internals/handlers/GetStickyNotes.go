package handlers

import (
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type GetStickyNotesResponse struct {
	StickyNotes []models.StickyNote `json:"sticky_notes"`
}

func GetStickyNotes(c *gin.Context) {
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

	var stickyNotes []models.StickyNote
	if err := database.DB.
		Preload("Content").
		Where("owner_id = ?", profileID).Find(&stickyNotes).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to retrieve sticky notes"})
		return
	}

	c.JSON(200, GetStickyNotesResponse{
		StickyNotes: stickyNotes,
	})

}
