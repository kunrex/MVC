package main

import (
	"MVC/pkg/api"
	"MVC/pkg/config"
	"MVC/pkg/database"
	"MVC/pkg/database/models"
	"MVC/pkg/types"
	"MVC/pkg/utils"
	"MVC/pkg/workers"
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func loadUtils(configuration *types.Config) bool {
	utils.InitJWT(configuration)
	log.Printf("jwt initialised")

	utils.InitHashing(configuration)
	log.Printf("bycrypt initialised")

	if configuration.IsContainerInstance {
		err := database.InitDatabase(configuration)
		if err != nil {
			log.Fatal(err)
		}
	}

	db := database.ConnectDatabase(configuration)
	if db != nil {
		log.Printf("database initualisation failed: %v", db.Error())
		return false
	} else {
		log.Print("database connection initialised")
	}

	models.ReloadTagCache()
	models.ReloadMenuCache()

	return true
}

func serverInit(config *types.Config, server *http.Server) {
	log.Printf("starting server on %s\n", server.Addr)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Printf("server error: %v", err)
	}
}

func createQuitSignal() chan os.Signal {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	return quit
}

func main() {
	configuration := config.InitConfig()
	if configuration == nil {
		log.Fatal("failed to load configuration file")
	}

	ok := loadUtils(configuration)
	if !ok {
		return
	}

	router := api.InitRouter()
	server := &http.Server{
		Addr:    fmt.Sprintf(":%v", configuration.AppPort),
		Handler: router,
	}

	go serverInit(configuration, server)

	quit := createQuitSignal()
	workers.InitOrderSessionClearanceWorker(quit)

	<-quit

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
