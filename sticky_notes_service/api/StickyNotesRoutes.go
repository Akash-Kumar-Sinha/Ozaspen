package api

import (
	"sticky_notes_service/internals/handlers"
	collaborator "sticky_notes_service/internals/handlers/Collaborator"
	generatelink "sticky_notes_service/internals/handlers/GenerateLink"
	"sticky_notes_service/internals/middlewares"
	"sticky_notes_service/internals/ws"

	"github.com/gin-gonic/gin"
)

func StickyNotesRoutes(router *gin.RouterGroup) {
	router.POST("/create_new_sticky_note", middlewares.Auth(), handlers.CreateNewStickyNote)
	router.POST("/save_sticky_notes", middlewares.Auth(), ws.SaveStickyNotes)
	router.GET("/get_sticky_notes", middlewares.Auth(), handlers.GetStickyNotes)
	router.DELETE("/delete_sticky_note/:id", middlewares.Auth(), handlers.DeleteStickyNote)
	router.PUT("/generate_share_link/:id", middlewares.Auth(), generatelink.GenerateShareLink)
	router.PUT("/revoke_share_link/:id", middlewares.Auth(), generatelink.RevokeShareLink)
	router.GET("/get_sticky_note_by_share_link/:token", middlewares.Auth(), generatelink.GetStickyNoteByShareLink)
	router.PUT("/change_access/:id", middlewares.Auth(), generatelink.ChangeAccess)
	router.DELETE("/delete_sticky_note_link/:id", middlewares.Auth(), generatelink.DeleteStickyNoteLink)

	router.GET("/search_username/:username",middlewares.Auth(),  handlers.SearchUsername)
	router.PUT("/add_collaborator", middlewares.Auth(), collaborator.AddCollaborator)
	router.GET("/get_collaborators/:id", middlewares.Auth(), collaborator.GetCollaborator)
}
