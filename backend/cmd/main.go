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
	jwt := utils.InitJWT(configuration)
	log.Printf("jwt initialised: %v", jwt)

	hashing := utils.InitHashing(configuration)
	log.Printf("bycrypt initialised: %v", hashing)

	db := database.InitDB(configuration)
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

func createQuitSignal() chan os.Signal {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	return quit
}

func main() {
	configuration := config.InitConfig()
	if configuration == nil {
		log.Fatal("failed to load config")
		return
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

	go serverInit(server)

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
