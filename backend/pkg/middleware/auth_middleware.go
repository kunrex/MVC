package middleware

import (
	"MVC/pkg/controllers"
	"MVC/pkg/utils"
	"net/http"
)

func AuthUserMiddleware(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		utils.ReturnFailedResponse(http.StatusBadRequest, "invalid request body format", w)
		return
	}

	action := r.Form.Get("action")

	if action == "login" {
		controllers.LoginUserHandler(w, r)
	} else if action == "signup" {
		controllers.RegisterUserHandler(w, r)
	} else {
		utils.ReturnFailedResponse(http.StatusBadRequest, "invalid action", w)
	}
}
