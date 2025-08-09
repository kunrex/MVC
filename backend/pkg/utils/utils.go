package utils

import (
	"MVC/pkg/database/models"
	"context"
	"encoding/json"
	"net/http"
)

const AccessCookie = "awt"
const RefreshCookie = "rwt"

type ContextKey string

const UserId ContextKey = "id"
const UserAuthorisation ContextKey = "auth"

func Between(value int, min int, max int) bool {
	return min <= value && value <= max
}

func AddJSONHeaders(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		handler.ServeHTTP(w, r)
	})
}

func WriteFailedResponse(code int, error string, w http.ResponseWriter) {
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"error": error,
	})
}

func Authorise(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		accessCookie, accessCookieError := r.Cookie(AccessCookie)
		refreshCookie, refreshCookieError := r.Cookie(RefreshCookie)

		if accessCookieError != nil || refreshCookieError != nil || accessCookie.Value == "" || refreshCookie.Value == "" {
			WriteFailedResponse(http.StatusUnauthorized, "failed to authorise, please sign up if you dont have an account or log in again if you do", w)
			return
		}

		accessId, accessAuthorisation, err := VerifyToken(accessCookie.Value)
		if err != nil {
			w.WriteHeader(http.StatusTemporaryRedirect)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"refresh": "/auth/refresh",
				"method":  "POST",
			})

			return
		}

		authorisation, err := models.UserAuthorisation(accessId)
		if err != nil {
			WriteFailedResponse(http.StatusUnauthorized, "user does not exist, please sign up", w)
			return
		}

		if authorisation != accessAuthorisation {
			WriteFailedResponse(http.StatusUnauthorized, "user authorisation level changed, please log in again", w)
			return
		}

		ctx := context.WithValue(r.Context(), UserId, accessId)
		ctx = context.WithValue(ctx, UserAuthorisation, authorisation)
		r = r.WithContext(ctx)

		handler.ServeHTTP(w, r)
	})
}

func AuthoriseChef(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth := r.Context().Value(UserAuthorisation).(int)
		if (auth & 2) == 2 {
			handler.ServeHTTP(w, r)
		} else {
			WriteFailedResponse(http.StatusUnauthorized, "lacking chef permissions", w)
		}
	})
}

func AuthoriseAdmin(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth := r.Context().Value(UserAuthorisation).(int)
		if (auth & 4) == 4 {
			handler.ServeHTTP(w, r)
		} else {
			WriteFailedResponse(http.StatusUnauthorized, "lacking admin permissions", w)
		}
	})
}
