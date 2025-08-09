package api

import (
	"MVC/pkg/utils"
	"github.com/gorilla/mux"
)

func InitRouter() *mux.Router {
	router := mux.NewRouter()

	router.Use(utils.AddJSONHeaders)

	initAuthRoutes(router)
	initUserRoutes(router)

	initMenuRoute(router)
	initSingleOrderRoutes(router)
	initMultipleOrderRoutes(router)
	initSubordersRoutes(router)

	initAdminRoutes(router)

	return router
}
