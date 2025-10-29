package handlers

import (
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func DeleteStickyNote(c *gin.Context) {
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

	noteID := c.Param("id")
	noteUUID, err := uuid.Parse(noteID)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid note ID format"})
		return
	}

	result := database.DB.Where("id = ? AND owner_id = ?", noteUUID, profileID).Delete(&models.StickyNote{})
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "Failed to delete sticky note"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(404, gin.H{"error": "Sticky note not found or not owned by user"})
		return
	}

	c.JSON(200, gin.H{
		"message": "Sticky note deleted successfully",
		"success": true,
	})
}
