package savestickynotes

import (
	"sticky_notes_service/internals/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type SaveStickyNotesRequest struct {
	StickyNoteID string        `json:"sticky_note_id" binding:"required"`
	Blocks       models.Blocks `json:"blocks" binding:"required"`
}

func SaveStickyNotesApi(c *gin.Context) {
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
