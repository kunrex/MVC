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

	subRouter.Use(utils.Authorise)

	subRouter.HandleFunc("", controllers.NewOrderHandler).Methods("GET")
	subRouter.Handle("/{orderId}/{authorName}", utils.Chain(controllers.GetOrderDetailsHandler, middleware.OrderVerificationMiddleware)).Methods("GET")

	subRouter.Handle("/pay/{orderId}/{authorName}", utils.Chain(controllers.PayOrderHandler, middleware.OrderVerificationMiddleware)).Methods("POST")
	subRouter.Handle("/complete/{orderId}/{authorName}", utils.Chain(controllers.CompleteOrderHandler, middleware.OrderVerificationMiddleware)).Methods("POST")
}

func initSubordersRoutes(router *mux.Router) {
	subRouter := router.PathPrefix("/suborders").Subrouter()

	subRouter.Use(utils.Authorise)

	subRouter.Handle("/incomplete", utils.Chain(controllers.GetIncompleteSubordersHandler, utils.AuthoriseChef)).Methods("GET")
	subRouter.Handle("/incomplete/update", utils.Chain(controllers.UpdateIncompleteSubordersHandler, utils.AuthoriseChef)).Methods("PATCH", "OPTIONS")

	subRouter.Handle("/update/{orderId}/{authorName}", utils.Chain(controllers.UpdateSubordersHandler, middleware.OrderVerificationMiddleware)).Methods("PATCH", "OPTIONS")
	subRouter.Handle("/{orderId}/{authorName}", utils.Chain(controllers.GetSuborderDetailsHandler, middleware.OrderVerificationMiddleware)).Methods("GET")
}

func initMultipleOrderRoutes(router *mux.Router) {
	subRouter := router.PathPrefix("/orders").Subrouter()

	subRouter.Use(utils.Authorise)

	subRouter.HandleFunc("/user", controllers.GetUserOrdersHandler).Methods("GET")
	subRouter.Handle("/all", utils.Chain(controllers.GetAllOrdersHandler, utils.AuthoriseAdmin)).Methods("GET")
}
