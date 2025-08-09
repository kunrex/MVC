package controllers

import (
	"MVC/pkg/database/models"
	"MVC/pkg/utils"
	"encoding/json"
	"net/http"
)

func SignOutUserHandler(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value(utils.UserId).(int64)

	if err := models.ClearRefreshHash(userId); err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, "failed to clear refresh hash", w)
		return
	}

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
