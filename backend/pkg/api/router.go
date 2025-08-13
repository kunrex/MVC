package api

import (
	"MVC/pkg/middleware"
	"MVC/pkg/utils"
	"github.com/gorilla/mux"
	"net/http"
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

	router.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("./assets"))))

	return router
}
