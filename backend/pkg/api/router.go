package api

import (
	"MVC/pkg/controllers"
	"MVC/pkg/middleware"
	"MVC/pkg/utils"
	"github.com/gorilla/mux"
)

func InitRouter() *mux.Router {
	r := mux.NewRouter()

	initAuthRoutes(r)
	initUserRoutes(r)

	initOrderRoutes(r)

	initAdminRoutes(r)

	return r
}

func initAuthRoutes(r *mux.Router) {
	r.HandleFunc("/auth", utils.AddJSONHeaders(middleware.AuthUserMiddleware))
	r.HandleFunc("/auth/refresh", utils.AddJSONHeaders(controllers.AuthRefreshHandler))
}

func initUserRoutes(r *mux.Router) {
	r.HandleFunc("/user/signOut", utils.AddJSONHeaders(utils.Authorise(controllers.SignOutUserHandler)))
	r.HandleFunc("/user/authorisation/", utils.AddJSONHeaders(utils.Authorise(controllers.GetAuthorisationHandler)))
}

func initOrderRoutes(r *mux.Router) {
	r.HandleFunc("/menu", utils.AddJSONHeaders(utils.Authorise(controllers.GetTagMenuCacheHandler)))

	r.HandleFunc("/order", utils.AddJSONHeaders(utils.Authorise(controllers.NewOrderHandler)))
	r.HandleFunc("/order/{orderId}", utils.AddJSONHeaders(utils.Authorise(middleware.OrderReadonlyMiddleware(controllers.GetOrderDetailsHandler))))
	r.HandleFunc("/order/{orderId}/{authorName}", utils.AddJSONHeaders(utils.Authorise(middleware.OrderVerificationMiddleware(controllers.GetOrderDetailsHandler))))

	r.HandleFunc("/suborders/{orderId}/{authorName}", utils.AddJSONHeaders(utils.Authorise(middleware.OrderVerificationMiddleware(controllers.GetSuborderDetailsHandler))))
	r.HandleFunc("/suborders/update/{orderId}/{authorName}", utils.AddJSONHeaders(utils.Authorise(middleware.OrderVerificationMiddleware(controllers.UpdateSubordersHandler))))

	r.HandleFunc("/order/pay/{orderId}/{authorName}", utils.AddJSONHeaders(utils.Authorise(middleware.OrderVerificationMiddleware(controllers.PayOrderHandler))))
	r.HandleFunc("/order/complete/{orderId}/{authorName}", utils.AddJSONHeaders(utils.Authorise(middleware.OrderVerificationMiddleware(controllers.CompleteOrderHandler))))

	r.HandleFunc("/orders/all", utils.AddJSONHeaders(utils.Authorise(utils.AuthoriseAdmin(controllers.GetAllOrdersHandler))))
	r.HandleFunc("/orders/user", utils.AddJSONHeaders(utils.Authorise(utils.AuthoriseChef(controllers.GetUserOrdersHandler))))
	r.HandleFunc("/orders/incomplete", utils.AddJSONHeaders(utils.Authorise(utils.AuthoriseChef(controllers.IncompleteSubordersHandler))))
}

func initAdminRoutes(r *mux.Router) {
	r.HandleFunc("/admin/user/authorisation/get/{userEmail}", utils.AddJSONHeaders(utils.Authorise(utils.AuthoriseAdmin(controllers.GetUserAuthorisationHandler))))
	r.HandleFunc("/admin/user/authorisation/set/{userId}/{authorisation}", utils.AddJSONHeaders(utils.Authorise(utils.AuthoriseAdmin(controllers.SetUserAuthorisationHandler))))

	r.HandleFunc("/admin/tags/add/{tag}", utils.AddJSONHeaders(utils.Authorise(utils.AuthoriseAdmin(controllers.AddTagHandler))))

	r.HandleFunc("/admin/food/add", utils.AddJSONHeaders(utils.Authorise(utils.AuthoriseAdmin(controllers.AddFoodHandler))))
	r.HandleFunc("/admin/food/tags/update", utils.AddJSONHeaders(utils.Authorise(utils.AuthoriseAdmin(controllers.UpdateFoodTagHandler))))
}
