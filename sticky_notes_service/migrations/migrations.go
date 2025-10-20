package main

import (
	"log"
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/models"
)

func init() {
	database.LoadInitializers()
	database.ConnectToDb()
}
func main() {
	database.DB.Migrator().DropTable(&models.Collaborator{}, &models.StickyNote{}, &models.ShareLink{}, models.Content{}, models.Blocks{})
	if err := database.DB.AutoMigrate(models.ShareLink{}); err != nil {
		log.Printf("Error during migration of ShareLink: %v", err)
		panic(err)
	}
	if err := database.DB.AutoMigrate(models.StickyNote{}); err != nil {
		log.Printf("Error during migration of StickyNote: %v", err)
		panic(err)
	}
	if err := database.DB.AutoMigrate(models.Collaborator{}); err != nil {
		log.Printf("Error during migration of Collaborator: %v", err)
		panic(err)
	}
	if err := database.DB.AutoMigrate(models.Content{}); err != nil {
		log.Printf("Error during migration of Content: %v", err)
		panic(err)
	}
	if err := database.DB.AutoMigrate(models.Blocks{}); err != nil {
		log.Printf("Error during migration of Blocks: %v", err)
		panic(err)
	}
}
