package main

import (
	"auth_service/internals/database"
	"auth_service/internals/models"
	"log"
)

func init() {
	database.LoadInitializers()
	database.ConnectToDb()
}

func main() {
	database.DB.Migrator().DropTable(&models.User{}, &models.Profile{})
	if err := database.DB.AutoMigrate(models.Profile{}); err != nil {
		log.Printf("Error during migration of Profile: %v", err)
		panic(err)
	}
	if err := database.DB.AutoMigrate(models.User{}); err != nil {
		log.Printf("Error during migration of User: %v", err)
		panic(err)
	}
}
