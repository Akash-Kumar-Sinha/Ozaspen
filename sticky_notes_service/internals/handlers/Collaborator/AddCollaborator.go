package collaborator

import (
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AddCollaboratorRequest struct {
	StickyNoteID string      `json:"sticky_note_id" binding:"required,uuid"`
	ProfileID    string      `json:"profile_id" binding:"required,uuid"`
	Role         models.Role `json:"role" binding:"required,oneof=viewer editor admin"`
}

func AddCollaborator(c *gin.Context) {

	var req AddCollaboratorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": "internal server error"})
		}
	}()

	stickyNoteID, err := uuid.Parse(req.StickyNoteID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid sticky_note_id"})
		return
	}

	profileID, err := uuid.Parse(req.ProfileID)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid profile_id"})
		return
	}

	collaboratorModel := models.Collaborator{
		StickyNoteID: stickyNoteID,
		ProfileID:    profileID,
		Role:         req.Role,
	}

	if err := tx.Create(&collaboratorModel).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "failed to add collaborator"})
		return
	}

	tx.Commit()
	c.JSON(200, gin.H{"message": "collaborator added successfully"})
}
