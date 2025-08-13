package utils

import (
	"MVC/pkg/config"
	"encoding/json"
	"github.com/gorilla/mux"
	"io"
	"net/http"
	"os"
	"time"
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
		Name:     AccessCookie,
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

func ToLocalTime(timeString string) string {
	parsed, _ := time.Parse("2006-01-02 15:04:05", "2025-08-13 16:02:31")
	return parsed.Add(time.Minute * time.Duration(config.TimeZoneMinutes)).Format("2006-01-02 15:04:05")
}
