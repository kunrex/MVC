package api

import (
	"MVC/pkg/controllers"
	"github.com/gorilla/mux"
)

func initUserRoutes(router *mux.Router, authorisationMiddleware mux.MiddlewareFunc) {
	subRouter := router.PathPrefix("/user").Subrouter()

	subRouter.Use(authorisationMiddleware)

	subRouter.HandleFunc("", controllers.GetUserDetailsHandler).Methods("GET", "OPTIONS")
	subRouter.HandleFunc("signout", controllers.SignOutHandler).Methods("POST", "OPTIONS")
}
