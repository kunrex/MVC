package api

import (
	"MVC/pkg/middleware"
	"MVC/pkg/utils"
	"github.com/gorilla/mux"
	"net/http"
)

func InitRouter() *mux.Router {
	router := mux.NewRouter()

	router.Use(middleware.CORSMiddleware)
	router.Use(utils.AddJSONHeaders)

	initAuthRoutes(router)
	initUserRoutes(router)

	initAdminRoutes(router)

	initMenuRoute(router)
	initSubordersRoutes(router)
	initSingleOrderRoutes(router)
	initMultipleOrderRoutes(router)

	router.PathPrefix("/assets/").Handler(http.StripPrefix("/assets/", http.FileServer(http.Dir("./assets"))))

	return router
}
