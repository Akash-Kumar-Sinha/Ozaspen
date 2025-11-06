package main

import (
	"auth_service/api"
	"auth_service/internals/database"
	"os"
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
	PORT := os.Getenv("PORT")

	if PORT == "" {
		PORT = "8000"
	}

	frontendDomain := os.Getenv("FRONTEND_DOMAIN")
	stickyNoteServiceDomain := os.Getenv("BACKEND_STICKY_NOTE_SERVICE_DOMAIN")

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{frontendDomain, stickyNoteServiceDomain},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "You are under my protection",
		})
	})

	router.GET("/api",
		func(c *gin.Context) {
			c.Redirect(301, "/")
		})
	router.GET("/api/v1", func(c *gin.Context) {
		c.Redirect(301, "/")
	})
	router.GET("/api/v1/auth", func(c *gin.Context) {
		c.Redirect(301, "/")
	})
	auth := router.Group("api/v1/auth")
	api.AuthRoutes(auth)

	router.Run("0.0.0.0:" + PORT)

}
