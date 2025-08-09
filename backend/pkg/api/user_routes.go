package api

import (
	"MVC/pkg/controllers"
	"MVC/pkg/utils"
	"github.com/gorilla/mux"
)

func initUserRoutes(router *mux.Router) {
	subRouter := router.PathPrefix("/user").Subrouter()

	subRouter.Use(utils.Authorise)

	subRouter.HandleFunc("/signout", controllers.SignOutUserHandler).Methods("POST")
	subRouter.HandleFunc("/permissions", controllers.GetPermissionsHandler).Methods("GET")
}
