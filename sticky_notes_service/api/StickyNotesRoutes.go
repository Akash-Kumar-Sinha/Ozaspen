package api

import (
	"sticky_notes_service/internals/handlers"
	"sticky_notes_service/internals/middlewares"

	"github.com/gin-gonic/gin"
)

func StickyNotesRoutes(router *gin.RouterGroup) {
	router.POST("/create_new_sticky_note", middlewares.Auth(), handlers.CreateNewStickyNote)
	router.POST("/save_sticky_notes", middlewares.Auth(), handlers.SaveStickyNotes)
	router.GET("/get_sticky_notes", middlewares.Auth(), handlers.GetStickyNotes)
	router.DELETE("/delete_sticky_note/:id", middlewares.Auth(), handlers.DeleteStickyNote)

}
