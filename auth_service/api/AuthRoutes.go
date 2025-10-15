package api

import (
	"auth_service/internals/handlers"
	"auth_service/internals/middlewares"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(router *gin.RouterGroup) {
	router.GET("/oauth/google/login", handlers.GoogleLogin)
	router.GET("/oauth/callback", handlers.GoogleCallback)

	router.GET("/auth/session", middlewares.SessionHandler)

	router.POST("/logout", middlewares.AuthSession(), handlers.Logout)
	router.GET("/me", middlewares.AuthSession(), handlers.GetCurrentUser)
}
