package main

import (
	"MVC/pkg/api"
	"MVC/pkg/database"
	"MVC/pkg/database/models"
	"MVC/pkg/utils"
	"context"
	"errors"
	"os/signal"
	"syscall"
	"time"

	"fmt"
	"log"
	"net/http"
	"os"
)

func loadEnv() bool {
	ok := utils.LoadEnv()
	if !ok {
		log.Print("error loading env")
		return false
	}

	return true
}

func loadUtils() bool {
	jwt := utils.InitJWT()
	log.Printf("jwt initialised: %v", jwt)

	hashing := utils.InitHashing()
	log.Printf("bycrypt initialised: %v", hashing)

	db := database.InitDB()
	log.Printf("database connection initialised: %v", db)

	models.ReloadTagCache()
	models.ReloadMenuCache()

	return jwt && hashing && db
}

func serverInit(server *http.Server) {
	log.Printf("starting server on %s\n", server.Addr)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Printf("server error: %v", err)
	}
}

func waitForShutdown() {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
}

func main() {
	ok := loadEnv()
	if !ok {
		return
	}

	ok = loadUtils()
	if !ok {
		return
	}

	router := api.InitRouter()
	server := &http.Server{
		Addr:    fmt.Sprintf(":%v", os.Getenv("APP_PORT")),
		Handler: router,
	}

	go serverInit(server)

	waitForShutdown()
	log.Println("shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {

		log.Printf("server forced to shutdown: %v", err)
	}
	err := database.DB.Close()

	if err != nil {
		log.Println(err.Error())
	} else {
		log.Println("server gracefully stopped")
	}
}
