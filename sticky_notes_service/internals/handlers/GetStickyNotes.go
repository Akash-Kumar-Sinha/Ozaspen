package handlers

import (
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/helpers"
	"sticky_notes_service/internals/models"

	"github.com/gin-gonic/gin"
)

type GetStickyNotesResponse struct {
	StickyNotes []models.StickyNote `json:"sticky_notes"`
}

func GetStickyNotes(c *gin.Context) {

	profileID := helpers.GetProfileID(c)

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
