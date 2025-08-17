package api

import (
	"MVC/pkg/controllers"
	"github.com/gorilla/mux"
)

func initAuthRoutes(router *mux.Router) {
	router.HandleFunc("/auth", controllers.AuthoriseUserHandler).Methods("POST", "OPTIONS")
}
