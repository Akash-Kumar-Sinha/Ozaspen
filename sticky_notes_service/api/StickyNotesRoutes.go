package api

import (
	"sticky_notes_service/internals/middlewares"

	"github.com/gin-gonic/gin"
)

func StickyNotesRoutes(router *gin.RouterGroup) {
	router.GET("/check", middlewares.Auth(), check)

}

func check(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Sticky Notes Check Service is running",
	})
}
