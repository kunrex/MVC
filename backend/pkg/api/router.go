package api

import (
	"MVC/pkg/middleware"
	"MVC/pkg/utils"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
)

func InitRouter() *mux.Router {
	router := mux.NewRouter()

	router.Use(func(handler http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			fmt.Print(r.URL)
			handler.ServeHTTP(w, r)
		})
	})

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
