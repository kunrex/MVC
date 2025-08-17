package api

import (
	"MVC/pkg/controllers"
	"MVC/pkg/middleware"
	"github.com/gorilla/mux"
)

func initAdminRoutes(router *mux.Router) {
	subRouter := router.PathPrefix("/admin").Subrouter()

	subRouter.Use(middleware.Authorise)
	subRouter.Use(middleware.AuthoriseAdmin)

	subRouter.HandleFunc("/tags/add/{tag}", controllers.AddTagHandler).Methods("POST", "OPTIONS")

	subRouter.HandleFunc("/food/add", controllers.AddFoodHandler).Methods("POST", "OPTIONS")
	subRouter.HandleFunc("/food/updateTags", controllers.UpdateFoodTagHandler).Methods("PATCH", "OPTIONS")

	subRouter.HandleFunc("/user/authorisation/get", controllers.GetAllAuthorisationsHandler).Methods("GET", "OPTIONS")
	subRouter.HandleFunc("/user/authorisation/set/{userId}/{authorisation}", controllers.SetUserAuthorisationHandler).Methods("PATCH, OPTIONS")
}
