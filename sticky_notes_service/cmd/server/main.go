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

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, 
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true, 
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Sticky Notes Service is running",
		})
	})

	router.GET("/debug", func(c *gin.Context) {
		authDomain := os.Getenv("BACKEND_AUTH_DOMAIN")
		authUrl := ""
		if authDomain != "" {
			authUrl = authDomain + "/auth/session"
		}

		c.JSON(200, gin.H{
			"message":            "Debug Information",
			"service":            "sticky-notes-service",
			"auth_domain":        authDomain,
			"auth_url":           authUrl,
			"auth_domain_is_set": authDomain != "",
			"port":               port,
			"environment_variables": map[string]string{
				"BACKEND_AUTH_DOMAIN": authDomain,
				"PORT":                os.Getenv("PORT"),
			},
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

	stickynotes := router.Group("api/v1/sticky-notes")

	api.StickyNotesRoutes(stickynotes)

	router.Run(":" + port)
}
