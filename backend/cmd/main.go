package main

import (
	"MVC/pkg/api"
	"MVC/pkg/database"
	utils2 "MVC/pkg/utils"
	"context"
	"errors"
	"github.com/joho/godotenv"
	"os/signal"
	"syscall"
	"time"

	"fmt"
	"log"
	"net/http"
	"os"
)

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

	router := api.InitRouter()

	server := &http.Server{
		Addr:    fmt.Sprintf(":%v", os.Getenv("APP_PORT")),
		Handler: router,
	}

	go func() {
		log.Printf("Starting server on %s\n", server.Addr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	if err = server.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	}

	err = http.ListenAndServe(fmt.Sprintf(":%v", server.Addr), nil)
	_ = database.DB.Close()

	cancel()
	log.Println("Server gracefully stopped")

	log.Fatal(err)
}
