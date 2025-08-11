package api

import (
	"MVC/pkg/middleware"
	"MVC/pkg/utils"
	"github.com/gorilla/mux"
)

func InitRouter() *mux.Router {
	router := mux.NewRouter()

	router.Use(utils.AddJSONHeaders)
	router.Use(middleware.CORSMiddleware)

	initAuthRoutes(router)
	initUserRoutes(router)

	initMenuRoute(router)
	initSingleOrderRoutes(router)
	initMultipleOrderRoutes(router)
	initSubordersRoutes(router)

	initAdminRoutes(router)

	return router
}
