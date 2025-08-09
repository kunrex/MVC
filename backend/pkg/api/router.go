package api

import (
	"MVC/pkg/utils"
	"github.com/gorilla/mux"
)

func InitRouter() *mux.Router {
	r := mux.NewRouter()

	r.Use(utils.AddJSONHeaders)

	initAuthRoutes(r)
	initUserRoutes(r)

	initMenuRoute(r)
	initOrderRoutes(r)
	initOrdersRoutes(r)
	initSubordersRoutes(r)

	initAdminRoutes(r)

	return r
}
