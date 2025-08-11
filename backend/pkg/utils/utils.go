package utils

import (
	"MVC/pkg/database/models"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	"io"
	"net/http"
	"os"
	"strings"
)

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

func GenerateAccessCookie(value string) *http.Cookie {
	return &http.Cookie{
		Name:     accessCookie,
		Value:    value,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	}
}

func GenerateLoginCookie(loggedIn bool) *http.Cookie {
	value := ""
	if loggedIn {
		value = "true"
	}

	return &http.Cookie{
		Name:     loginCookie,
		Value:    value,
		Path:     "/",
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	}
}

func Authorise(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		accessCookie, accessCookieError := r.Cookie(accessCookie)

		if accessCookieError != nil || accessCookie.Value == "" {
			WriteFailedResponse(http.StatusUnauthorized, "failed to authorise, please sign up if you dont have an account or log in again if you do", w)
			return
		}

		accessId, accessAuthorisation, err := VerifyToken(accessCookie.Value)
		if err != nil {
			WriteFailedResponse(http.StatusUnauthorized, "access token expired, please log in again", w)
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

func Chain(handlerFunc func(w http.ResponseWriter, r *http.Request), middleware ...mux.MiddlewareFunc) http.Handler {
	handler := http.Handler(http.HandlerFunc(handlerFunc))

	for i := len(middleware) - 1; i >= 0; i-- {
		handler = middleware[i](handler)
	}
	return handler
}

func CalculateDiscount(subtotal float32) int {
	if subtotal > 2000 {
		return 10
	} else if subtotal > 1000 {
		return 5
	}

	return 0
}

func DownloadImage(url string, imgPath string) error {
	headResponse, err := http.Head(url)
	defer func(Body io.ReadCloser) {
		_ = Body.Close()
	}(headResponse.Body)
	if err != nil {
		return err
	}

	if headResponse.StatusCode != http.StatusOK {
		return fmt.Errorf("bad status: %v", headResponse.Status)
	}

	contentType := headResponse.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		return errors.New("URL does not point to an image")
	}

	resp, err := http.Get(url)
	defer func(Body io.ReadCloser) {
		_ = Body.Close()
	}(resp.Body)
	if err != nil {
		return err
	}

	out, err := os.Create(imgPath)
	defer func(out *os.File) {
		_ = out.Close()
	}(out)
	if err != nil {
		_ = resp.Body.Close()
		return err
	}

	_, err = io.Copy(out, resp.Body)
	return err
}
