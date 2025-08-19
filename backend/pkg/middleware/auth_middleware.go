package middleware

import (
	"MVC/pkg/database/models"
	"MVC/pkg/utils"
	"context"
	"errors"
	"net/http"
	"strings"
)

func parseAccessToken(accessToken string) (error, int64, int) {
	accessId, accessAuthorisation, err := utils.VerifyToken(accessToken)
	if err != nil {
		return errors.New("access token expired, please log in again"), -1, -1
	}

	authorisation, err := models.UserAuthorisation(accessId)
	if err != nil {
		return errors.New("user does not exist, please sign up"), -1, -1
	}

	if authorisation != accessAuthorisation {
		return errors.New("user authorisation level changed, please log in again"), -1, -1
	}

	return nil, accessId, authorisation
}

func AuthoriseCookie(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(utils.AccessCookie)
		if err != nil {
			utils.WriteFailedResponse(http.StatusUnauthorized, "access cookie not found, please sign up if you dont have an account or log in if you do", w)
			return
		}

		err, accessId, authorisation := parseAccessToken(cookie.Value)
		if err != nil {
			utils.WriteFailedResponse(http.StatusUnauthorized, err.Error(), w)
			return
		}

		ctx := context.WithValue(r.Context(), utils.UserId, accessId)
		ctx = context.WithValue(ctx, utils.UserAuthorisation, authorisation)
		r = r.WithContext(ctx)

		handler.ServeHTTP(w, r)
	})
}

func AuthoriseHeader(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if !strings.HasPrefix(authHeader, utils.HeaderPrefix) {
			utils.WriteFailedResponse(http.StatusBadRequest, "failed to parse access token, please provider authorization token as: `Authorization: Bearer {Token}`", w)
			return
		}

		err, accessId, authorisation := parseAccessToken(strings.TrimPrefix(authHeader, utils.HeaderPrefix))
		if err != nil {
			utils.WriteFailedResponse(http.StatusUnauthorized, err.Error(), w)
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
