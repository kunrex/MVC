package main

import (
	"MVC/pkg/database"
	utils2 "MVC/pkg/utils"
	"github.com/joho/godotenv"

	"fmt"
	"log"
	"net/http"
	"os"
)

// add json headers middleware for all requests
func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
		return
	}

	jwt := utils2.InitJWT()
	log.Printf("JWT Initialised: %v", jwt)
	hashing := utils2.InitHashing()
	log.Printf("Bycrypt Initialised: %v", hashing)

	db := database.InitDB()
	log.Printf("Database Connection Initialised: %v", db)

	if !jwt || !hashing || !db {
		return
	}

	err = http.ListenAndServe(fmt.Sprintf(":%v", os.Getenv("APP_PORT")), nil)
	_ = database.DB.Close()

	log.Fatal(err)
}
