package utils

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"io"
	"net/http"
	"os"
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

func Chain(handlerFunc func(w http.ResponseWriter, r *http.Request), middleware ...mux.MiddlewareFunc) http.Handler {
	handler := http.Handler(http.HandlerFunc(handlerFunc))

	for i := len(middleware) - 1; i >= 0; i-- {
		handler = middleware[i](handler)
	}
	return handler
}

func SetAccessCookie(token string, w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     AccessCookie,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
	})
}

func ClearAccessCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     AccessCookie,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
	})
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
