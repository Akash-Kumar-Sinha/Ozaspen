package handlers

import (
	"auth_service/internals/database"
	"auth_service/internals/helpers"
	"auth_service/internals/models"
	"context"
	"fmt"
	"net/http"
	"net/mail"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"google.golang.org/api/idtoken"
)

func GoogleCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Authorization code not provided"})
		return
	}

	token, err := googleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to exchange token", "details": err.Error()})
		return
	}

	userInfo, err := helpers.GetUserInfoFromGoogle(token.AccessToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info", "details": err.Error()})
		return
	}

	if idToken, ok := token.Extra("id_token").(string); ok {
		if err := ValidateGoogleIDToken(idToken, userInfo.ID); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid ID token", "details": err.Error()})
			return
		}
	}

	user, err := findOrCreateUser(userInfo, token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create/update user", "details": err.Error()})
		return
	}

	if user == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User creation failed"})
		return
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Frontend URL not configured"})
		return
	}

	redirectURL, err := url.Parse(frontendURL + "/workspace")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid frontend URL"})
		return
	}

	backendDomain := os.Getenv("BACKEND_AUTH_DOMAIN")

	if token.AccessToken != "" {

		c.SetCookie(
			"access_token",
			token.AccessToken,
			3600,
			"/",
			backendDomain,
			false,
			true,
		)
	}

	if token.RefreshToken != "" {
		c.SetCookie(
			"refresh_token",
			token.RefreshToken,
			7*24*3600,
			"/",
			backendDomain,
			false,
			true,
		)
	}

	c.Redirect(http.StatusTemporaryRedirect, redirectURL.String())
}

func ValidateGoogleIDToken(idToken, expectedSubject string) error {
	clientID := os.Getenv("GOOGLE_AUTH_CLIENT_ID")
	payload, err := idtoken.Validate(context.Background(), idToken, clientID)
	if err != nil {
		return fmt.Errorf("failed to validate ID token: %v", err)
	}

	if payload.Subject != expectedSubject {
		return fmt.Errorf("subject mismatch: expected %s, got %s", expectedSubject, payload.Subject)
	}

	return nil
}

func findOrCreateUser(userInfo *helpers.GoogleUserInfo, token *oauth2.Token) (*models.User, error) {
	var user models.User
	var profile models.Profile

	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	err := tx.Preload("Profile").Where("provider = ? AND provider_client_id = ?", "google", userInfo.ID).First(&user).Error
	if err != nil {
		profileExists := tx.Where("email = ?", userInfo.Email).First(&profile).Error == nil

		if !profileExists {

			addr, err := mail.ParseAddress(userInfo.Email)
			if err != nil {
				// invalid email
			}
			username := strings.SplitN(addr.Address, "@", 2)[0]
			firstName, middleName, lastName := helpers.SplitName(userInfo.Name)

			middleNameStr := ""
			if middleName != nil {
				middleNameStr = *middleName
			}

			profile = models.Profile{
				Email:      userInfo.Email,
				FirstName:  firstName,
				MiddleName: middleNameStr,
				Username:   username,
				LastName:   lastName,
				Avatar:     userInfo.Picture,
			}

			if err := tx.Create(&profile).Error; err != nil {
				tx.Rollback()
				return nil, fmt.Errorf("failed to create profile: %v", err)
			}
		}

		user = models.User{
			ProfileID:        profile.ID,
			Provider:         "google",
			ProviderClientID: userInfo.ID,
			LastLogin:        time.Now(),
		}

		if err := tx.Create(&user).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to create user: %v", err)
		}

		user.Profile = profile
	} else {

		if err := tx.Model(&user).Update("last_login", time.Now()).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to update last login: %v", err)
		}
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to commit transaction: %v", err)
	}

	return &user, nil
}
