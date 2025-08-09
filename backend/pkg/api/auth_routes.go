package api

import (
	"MVC/pkg/controllers"
	"github.com/gorilla/mux"
)

func initAuthRoutes(r *mux.Router) {
	subRouter := r.PathPrefix("/auth").Subrouter()

	subRouter.HandleFunc("", controllers.AuthoriseUserHandler).Methods("POST")
}
