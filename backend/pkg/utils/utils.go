package utils

import (
	"MVC/pkg/database/models"
	"context"
	"encoding/json"
	"github.com/joho/godotenv"
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

func LoadEnv() bool {
	err := godotenv.Load()
	return err == nil
}

func AddJSONHeaders(handler http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
	})
}

func ReturnFailedResponse(code int, error string, w http.ResponseWriter) {
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"error": error,
	})
}

func Authorise(handler http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, refreshCookieError := r.Cookie(RefreshCookie)
		accessCookie, accessCookieError := r.Cookie(AccessCookie)

		if accessCookieError != nil || refreshCookieError != nil {
			ReturnFailedResponse(http.StatusUnauthorized, "failed to authorise, please sign up if you dont have an account or log in again if you do", w)
			return
		}

		accessId, accessAuthorisation, err := VerifyToken(accessCookie.Value)
		if err != nil {
			http.Redirect(w, r, "/auth/refresh", http.StatusFound)
			return
		}

		authorisation, err := models.UserAuthorisation(accessId)
		if err != nil {
			ReturnFailedResponse(http.StatusUnauthorized, "user does not exist, please sign up", w)
			return
		}

		if authorisation != accessAuthorisation {
			ReturnFailedResponse(http.StatusUnauthorized, "user authorisation level changed, please log in again", w)
			return
		}

		ctx := context.WithValue(r.Context(), UserId, accessId)
		ctx = context.WithValue(ctx, UserAuthorisation, authorisation)
		r = r.WithContext(ctx)

		handler.ServeHTTP(w, r)
	})
}

func AuthoriseChef(handler http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth := r.Context().Value(UserAuthorisation).(int)
		if (auth & 2) == 2 {
			handler.ServeHTTP(w, r)
		} else {
			ReturnFailedResponse(http.StatusUnauthorized, "lacking chef permissions", w)
		}
	})
}

func AuthoriseAdmin(handler http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth := r.Context().Value(UserAuthorisation).(int)
		if (auth & 4) == 4 {
			handler.ServeHTTP(w, r)
		} else {
			ReturnFailedResponse(http.StatusUnauthorized, "lacking admin permissions", w)
		}
	})
}
