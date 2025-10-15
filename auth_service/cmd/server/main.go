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

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:8080"}, // frontend URL
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true, // crucial for HttpOnly cookies
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
