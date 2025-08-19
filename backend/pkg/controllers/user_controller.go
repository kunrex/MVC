package controllers

import (
	"MVC/pkg/database/models"
	"MVC/pkg/types"
	"MVC/pkg/utils"
	"encoding/json"
	"net/http"
)

func GetUserDetailsHandler(w http.ResponseWriter, r *http.Request) {
	id := r.Context().Value(utils.UserId).(int64)
	authorisation := r.Context().Value(utils.UserAuthorisation).(int)

	name, err := models.GetUserName(id)
	if err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, "failed to get user name", w)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(types.UserDetailsResponse{
		Name:  name,
		Chef:  (authorisation & 2) == 2,
		Admin: (authorisation & 4) == 4,
	})
}

func SignOutHandler(w http.ResponseWriter, r *http.Request) {
	utils.ClearAccessCookie(w)
	w.WriteHeader(http.StatusOK)
}
