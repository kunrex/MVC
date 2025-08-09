package api

import (
	"MVC/pkg/controllers"
	"MVC/pkg/middleware"
	"MVC/pkg/utils"
	"github.com/gorilla/mux"
	"net/http"
)

func chain(handlerFunc func(w http.ResponseWriter, r *http.Request), middleware ...mux.MiddlewareFunc) http.Handler {
	handler := http.Handler(http.HandlerFunc(handlerFunc))

	for i := len(middleware) - 1; i >= 0; i-- {
		handler = middleware[i](handler)
	}
	return handler
}

func initMenuRoute(r *mux.Router) {
	r.HandleFunc("/menu", controllers.GetTagMenuCacheHandler).Methods("GET")
}

func initOrderRoutes(r *mux.Router) {
	subRouter := r.PathPrefix("/order").Subrouter()

	subRouter.Use(utils.Authorise)

	subRouter.HandleFunc("/", controllers.NewOrderHandler).Methods("GET")
	subRouter.Handle("/{orderId}/{authorName}", chain(controllers.GetOrderDetailsHandler, middleware.OrderVerificationMiddleware)).Methods("GET")

	subRouter.Handle("/pay/{orderId}/{authorName}", chain(controllers.PayOrderHandler, middleware.OrderVerificationMiddleware)).Methods("POST")
	subRouter.Handle("/complete/{orderId}/{authorName}", chain(controllers.CompleteOrderHandler, middleware.OrderVerificationMiddleware)).Methods("POST")
}

func initSubordersRoutes(r *mux.Router) {
	subRouter := r.PathPrefix("/suborders").Subrouter()

	subRouter.Use(utils.Authorise)
	subRouter.Use(middleware.OrderVerificationMiddleware)

	subRouter.Handle("/incomplete", chain(controllers.GetIncompleteSubordersHandler, utils.AuthoriseChef, middleware.OrderVerificationMiddleware)).Methods("GET")

	subRouter.Handle("/{orderId}/{authorName}", chain(controllers.GetSuborderDetailsHandler, middleware.OrderVerificationMiddleware)).Methods("GET")
	subRouter.Handle("/update/{orderId}/{authorName}", chain(controllers.UpdateSubordersHandler, middleware.OrderVerificationMiddleware)).Methods("PATCH")
}

func initOrdersRoutes(r *mux.Router) {
	subRouter := r.PathPrefix("/orders").Subrouter()

	subRouter.Use(utils.Authorise)

	subRouter.HandleFunc("/user", controllers.GetUserOrdersHandler).Methods("GET")
	subRouter.Handle("/all", chain(controllers.GetAllOrdersHandler, utils.AuthoriseAdmin)).Methods("GET")
}
