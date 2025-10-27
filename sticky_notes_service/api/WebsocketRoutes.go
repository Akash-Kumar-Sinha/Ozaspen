package api

import (
	"sticky_notes_service/internals/middlewares"
	"sticky_notes_service/internals/ws"

	"github.com/gin-gonic/gin"
)

func WebsocketRoutes(router *gin.RouterGroup) {
	hub := ws.NewHub()
	router.GET("/ws", middlewares.Auth(), hub.ServerWs)
}
