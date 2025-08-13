package middleware

import (
	"MVC/pkg/database/models"
	"MVC/pkg/utils"
	"context"
	"net/http"
)

func Authorise(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		accessCookie, accessCookieError := r.Cookie(utils.AccessCookie)

		if accessCookieError != nil || accessCookie.Value == "" {
			utils.WriteFailedResponse(http.StatusUnauthorized, "failed to authorise, please sign up if you dont have an account or log in again if you do", w)
			return
		}

		accessId, accessAuthorisation, err := utils.VerifyToken(accessCookie.Value)
		if err != nil {
			utils.WriteFailedResponse(http.StatusUnauthorized, "access token expired, please log in again", w)
			return
		}

		authorisation, err := models.UserAuthorisation(accessId)
		if err != nil {
			utils.WriteFailedResponse(http.StatusUnauthorized, "user does not exist, please sign up", w)
			return
		}

		if authorisation != accessAuthorisation {
			utils.WriteFailedResponse(http.StatusUnauthorized, "user authorisation level changed, please log in again", w)
			return
		}

		ctx := context.WithValue(r.Context(), utils.UserId, accessId)
		ctx = context.WithValue(ctx, utils.UserAuthorisation, authorisation)
		r = r.WithContext(ctx)

		handler.ServeHTTP(w, r)
	})
}

func AuthoriseChef(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth := r.Context().Value(utils.UserAuthorisation).(int)
		if (auth & 2) == 2 {
			handler.ServeHTTP(w, r)
		} else {
			utils.WriteFailedResponse(http.StatusUnauthorized, "lacking chef permissions", w)
		}
	})
}

func AuthoriseAdmin(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth := r.Context().Value(utils.UserAuthorisation).(int)
		if (auth & 4) == 4 {
			handler.ServeHTTP(w, r)
		} else {
			utils.WriteFailedResponse(http.StatusUnauthorized, "lacking admin permissions", w)
		}
	})
}
