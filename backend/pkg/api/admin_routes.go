package api

import (
	"MVC/pkg/controllers"
	"MVC/pkg/utils"
	"github.com/gorilla/mux"
)

func initAdminRoutes(router *mux.Router) {
	subRouter := router.PathPrefix("/admin").Subrouter()

	subRouter.Use(utils.Authorise)
	subRouter.Use(utils.AuthoriseAdmin)

	subRouter.HandleFunc("/user/authorisation/get/{userEmail}", controllers.GetUserAuthorisationHandler).Methods("GET")
	subRouter.HandleFunc("/user/authorisation/set/{userId}/{authorisation}", controllers.SetUserAuthorisationHandler).Methods("POST")

	subRouter.HandleFunc("/tags/add/{tag}", controllers.AddTagHandler).Methods("POST")

	subRouter.HandleFunc("/food/add", controllers.AddFoodHandler).Methods("POST")
	subRouter.HandleFunc("/food/updateTags", controllers.UpdateFoodTagHandler).Methods("PATCH")
}
