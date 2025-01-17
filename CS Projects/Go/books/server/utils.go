/**
Learned how to do user authentication through the following YT tutorial:
https://www.youtube.com/watch?v=OmLdoEMcr_Y&t=362s

Part of the code is from the video.
*/

package main

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	return string(bytes), err
}

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))

	return err == nil
}

func generateToken(length int) string {
	bytes := make([]byte, length)
	_, err := rand.Read(bytes)
	if err != nil {
		fmt.Println("Failed to generate token")
	}
	return base64.URLEncoding.EncodeToString(bytes)
}
