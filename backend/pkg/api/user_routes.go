package api

import (
	"MVC/pkg/controllers"
	"MVC/pkg/middleware"
	"MVC/pkg/utils"
	"github.com/gorilla/mux"
)

func initUserRoutes(router *mux.Router) {
	router.Handle("/user", utils.Chain(controllers.GetUserDetailsHandler, middleware.Authorise)).Methods("GET")
}
