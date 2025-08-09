package api

import (
	"MVC/pkg/controllers"
	"MVC/pkg/middleware"
	"MVC/pkg/utils"
	"github.com/gorilla/mux"
)

func initAuthRoutes(r *mux.Router) {
	r.HandleFunc("/auth", utils.AddJSONHeaders(middleware.AuthUserMiddleware)).Methods("POST")
	r.HandleFunc("/auth/refresh", utils.AddJSONHeaders(controllers.AuthRefreshHandler)).Methods("POST")
}

func initUserRoutes(r *mux.Router) {
	r.HandleFunc("/user/signOut", utils.AddJSONHeaders(utils.Authorise(controllers.SignOutUserHandler))).Methods("POST")
	r.HandleFunc("/user/authorisation", utils.AddJSONHeaders(utils.Authorise(controllers.GetAuthorisationHandler))).Methods("GET")
}

func initOrderRoutes(r *mux.Router) {
	r.HandleFunc("/menu", utils.AddJSONHeaders(controllers.GetTagMenuCacheHandler)).Methods("GET")

	r.HandleFunc("/order", utils.AddJSONHeaders(utils.Authorise(controllers.NewOrderHandler))).Methods("GET")
	r.HandleFunc("/order/{orderId}/{authorName}", utils.AddJSONHeaders(utils.Authorise(middleware.OrderVerificationMiddleware(controllers.GetOrderDetailsHandler)))).Methods("GET")

	r.HandleFunc("/suborders/incomplete", utils.AddJSONHeaders(utils.Authorise(utils.AuthoriseChef(controllers.GetIncompleteSubordersHandler)))).Methods("GET")
	r.HandleFunc("/suborders/{orderId}/{authorName}", utils.AddJSONHeaders(utils.Authorise(middleware.OrderVerificationMiddleware(controllers.GetSuborderDetailsHandler)))).Methods("GET")
	r.HandleFunc("/suborders/update/{orderId}/{authorName}", utils.AddJSONHeaders(utils.Authorise(middleware.OrderVerificationMiddleware(controllers.UpdateSubordersHandler)))).Methods("PATCH")

	r.HandleFunc("/order/pay/{orderId}/{authorName}", utils.AddJSONHeaders(utils.Authorise(middleware.OrderVerificationMiddleware(controllers.PayOrderHandler)))).Methods("POST")
	r.HandleFunc("/order/complete/{orderId}/{authorName}", utils.AddJSONHeaders(utils.Authorise(middleware.OrderVerificationMiddleware(controllers.CompleteOrderHandler)))).Methods("POST")

	r.HandleFunc("/orders/user", utils.AddJSONHeaders(utils.Authorise(controllers.GetUserOrdersHandler))).Methods("GET")
	r.HandleFunc("/orders/all", utils.AddJSONHeaders(utils.Authorise(utils.AuthoriseAdmin(controllers.GetAllOrdersHandler)))).Methods("GET")
}

func initAdminRoutes(r *mux.Router) {
	r.HandleFunc("/admin/user/authorisation/get/{userEmail}", utils.AddJSONHeaders(utils.Authorise(utils.AuthoriseAdmin(controllers.GetUserAuthorisationHandler)))).Methods("GET")
	r.HandleFunc("/admin/user/authorisation/set/{userId}/{authorisation}", utils.AddJSONHeaders(utils.Authorise(utils.AuthoriseAdmin(controllers.SetUserAuthorisationHandler)))).Methods("POST")

	r.HandleFunc("/admin/tags/add/{tag}", utils.AddJSONHeaders(utils.Authorise(utils.AuthoriseAdmin(controllers.AddTagHandler)))).Methods("POST")

	r.HandleFunc("/admin/food/add", utils.AddJSONHeaders(utils.Authorise(utils.AuthoriseAdmin(controllers.AddFoodHandler)))).Methods("POST")
	r.HandleFunc("/admin/food/tags/update", utils.AddJSONHeaders(utils.Authorise(utils.AuthoriseAdmin(controllers.UpdateFoodTagHandler)))).Methods("PATCH")
}

func InitRouter() *mux.Router {
	r := mux.NewRouter()

	initAuthRoutes(r)
	initUserRoutes(r)

	initOrderRoutes(r)

	initAdminRoutes(r)

	return r
}
