package controllers

import (
	"MVC/pkg/utils"
	"encoding/json"
	"net/http"
)

func SignOutUserHandler(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, utils.GenerateLoginCookie(false))
	http.SetCookie(w, utils.GenerateAccessCookie(""))

	w.WriteHeader(http.StatusOK)
}

func GetPermissionsHandler(w http.ResponseWriter, r *http.Request) {
	authorisation := r.Context().Value(utils.UserAuthorisation).(int)

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]bool{
		"chef":  (authorisation & 2) == 2,
		"admin": (authorisation & 4) == 4,
	})
}
