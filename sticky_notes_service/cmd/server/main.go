package main

import (
	"os"
	"sticky_notes_service/api"
	"sticky_notes_service/internals/database"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func init() {
	database.LoadInitializers()
	database.ConnectToDb()
}

func main() {
	router := gin.Default()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	frontendDomain := os.Getenv("FRONTEND_DOMAIN")

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{frontendDomain},
		AllowMethods:     []string{"GET", "POST", "OPTIONS", "DELETE", "PUT"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Sticky Notes Service is running",
		})
	})

	router.GET("/api",
		func(c *gin.Context) {
			c.Redirect(301, "/")
		})
	router.GET("/api/v1", func(c *gin.Context) {
		c.Redirect(301, "/")
	})

	router.GET("/api/v1/sticky-notes", func(c *gin.Context) {
		c.Redirect(301, "/")
	})

	router.GET("/api/v1/sticky-notes/connect", func(c *gin.Context) {
		c.Redirect(301, "/")
	})

	stickynotes := router.Group("api/v1/sticky-notes")
	websocket := router.Group("api/v1/sticky-notes/connect")

	api.StickyNotesRoutes(stickynotes)
	api.WebsocketRoutes(websocket)

	router.Run(":" + port)
}
