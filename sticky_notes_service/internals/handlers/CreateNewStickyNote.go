package handlers

import (
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/helpers"
	"sticky_notes_service/internals/models"

	"github.com/gin-gonic/gin"
)

type CreateNewStickyNoteRequest struct {
	NoteColors string       `json:"note_colors" binding:"required"`
	ID         string       `json:"id" binding:"required"`
	Type       string       `json:"type" binding:"required"`
	Props      models.Props `json:"props" binding:"required"`
}

func CreateNewStickyNote(c *gin.Context) {

	profileID := helpers.GetProfileID(c)

	var req CreateNewStickyNoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	blocksContent := models.BlocksContent{
		BlocksContentDetails: models.Blocks{
			{
				ID:    req.ID,
				Type:  req.Type,
				Props: req.Props,
			},
		},
		Changes: models.ChangesList{},
	}

	if err := tx.Create(&blocksContent).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Failed to create sticky note content"})
		return
	}

	stickyNotes := models.StickyNote{
		OwnerID:         profileID,
		NoteColors:      req.NoteColors,
		BlocksContentID: &blocksContent.ID,
	}

	if err := tx.Create(&stickyNotes).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Failed to create sticky note"})
		return
	}

	collaboratorEntry := models.Collaborator{
		StickyNoteID: stickyNotes.ID,
		ProfileID:    profileID,
		Role:         models.RoleOwner,
	}

	if err := tx.Create(&collaboratorEntry).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Failed to create collaborator entry"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(200, gin.H{
		"message":     "Sticky note created successfully",
		"success":     true,
		"sticky_note": stickyNotes,
	})

}
