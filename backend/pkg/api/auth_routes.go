package api

import (
	"MVC/pkg/controllers"
	"MVC/pkg/types"
	"github.com/gorilla/mux"
)

func initAuthRoutes(router *mux.Router, configuration *types.Config) {
	router.HandleFunc("/auth", controllers.AuthoriseUserHandler).Methods("POST", "OPTIONS")

	if configuration.UseCookies {
		router.HandleFunc("/auth/method", controllers.UseCookieHandler).Methods("GET", "OPTIONS")
	} else {
		router.HandleFunc("/auth/method", controllers.UseHeaderHandler).Methods("GET", "OPTIONS")
	}
}
