package api

import (
	"MVC/pkg/controllers"
	"MVC/pkg/middleware"
	"MVC/pkg/utils"
	"github.com/gorilla/mux"
)

func initMenuRoute(router *mux.Router) {
	router.HandleFunc("/menu", controllers.GetTagMenuCacheHandler).Methods("GET")
}

func initSingleOrderRoutes(router *mux.Router) {
	subRouter := router.PathPrefix("/order").Subrouter()

	subRouter.Use(middleware.Authorise)

	subRouter.HandleFunc("", controllers.NewOrderHandler).Methods("GET")
	subRouter.Handle("/{orderId}/{authorName}", utils.Chain(controllers.GetOrderDetailsHandler, middleware.OrderVerificationMiddleware)).Methods("GET")

	subRouter.Handle("/complete/{orderId}/{authorName}", utils.Chain(controllers.CompleteOrderHandler, middleware.OrderVerificationMiddleware)).Methods("POST")
	subRouter.Handle("/pay/{orderId}/{authorName}", utils.Chain(controllers.PayOrderHandler, middleware.OrderVerificationMiddleware)).Methods("POST", "OPTIONS")
}

func initSubordersRoutes(router *mux.Router) {
	subRouter := router.PathPrefix("/suborders").Subrouter()

	subRouter.Use(middleware.Authorise)

	subRouter.Handle("/incomplete", utils.Chain(controllers.GetIncompleteSubordersHandler, middleware.AuthoriseChef)).Methods("GET")
	subRouter.Handle("/incomplete/update", utils.Chain(controllers.UpdateIncompleteSubordersHandler, middleware.AuthoriseChef)).Methods("PATCH", "OPTIONS")

	subRouter.Handle("/update/{orderId}/{authorName}", utils.Chain(controllers.UpdateSubordersHandler, middleware.OrderVerificationMiddleware)).Methods("PATCH", "OPTIONS")
	subRouter.Handle("/{orderId}/{authorName}", utils.Chain(controllers.GetSuborderDetailsHandler, middleware.OrderVerificationMiddleware)).Methods("GET")
}

func initMultipleOrderRoutes(router *mux.Router) {
	subRouter := router.PathPrefix("/orders").Subrouter()

	subRouter.Use(middleware.Authorise)

	subRouter.HandleFunc("/user", controllers.GetUserOrdersHandler).Methods("GET")
	subRouter.Handle("/all", utils.Chain(controllers.GetAllOrdersHandler, middleware.AuthoriseAdmin)).Methods("GET")
}
