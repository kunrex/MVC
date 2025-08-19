package api

import (
	"MVC/pkg/middleware"
	"MVC/pkg/types"
	"MVC/pkg/utils"
	"github.com/gorilla/mux"
	"net/http"
)

func InitRouter(configuration *types.Config) *mux.Router {
	router := mux.NewRouter()

	router.Use(middleware.CORSMiddleware)
	router.Use(utils.AddJSONHeaders)

	var authorisationMiddleware mux.MiddlewareFunc
	if configuration.UseCookies {
		authorisationMiddleware = middleware.AuthoriseCookie
	} else {
		authorisationMiddleware = middleware.AuthoriseHeader
	}

	initMenuRoute(router)

	initAuthRoutes(router, configuration)
	initUserRoutes(router, authorisationMiddleware)

	initAdminRoutes(router, authorisationMiddleware)

	initSubordersRoutes(router, authorisationMiddleware)
	initSingleOrderRoutes(router, authorisationMiddleware)
	initMultipleOrderRoutes(router, authorisationMiddleware)

	router.PathPrefix("/assets/").Handler(http.StripPrefix("/assets/", http.FileServer(http.Dir("./assets"))))

	return router
}
