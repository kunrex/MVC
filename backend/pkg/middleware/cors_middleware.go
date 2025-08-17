package middleware

import (
	"MVC/pkg/utils"
	"net/http"
)

func CORSMiddleware(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", utils.AllowedHTTPOrigins)
		w.Header().Set("Access-Control-Allow-Methods", utils.AllowedHTTPMethods)
		w.Header().Set("Access-Control-Allow-Headers", utils.AllowedHTTPHeaders)

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		handler.ServeHTTP(w, r)
	})
}
