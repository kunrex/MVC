package middleware

import (
	"MVC/pkg/controllers"
	"MVC/pkg/database/models"
	"MVC/pkg/utils"
	"context"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"strconv"
)

func OrderVerificationMiddleware(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		orderId := vars["orderId"]

		convertedId, err := strconv.ParseInt(orderId, 10, 64)
		if err != nil {
			utils.WriteFailedResponse(http.StatusBadRequest, "invalid order id", w)
			return
		}

		authorName := vars["authorName"]

		cacheHit, cacheCheck := models.CheckOrderSessionCache(convertedId, authorName)
		if cacheHit {
			if !cacheCheck {
				utils.WriteFailedResponse(http.StatusBadRequest, "author provided did not match order creator", w)
				return
			}
		} else {
			expectedAuthor, err := models.GetOrderAuthor(convertedId)
			if err != nil {
				utils.WriteFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
				return
			}

			if expectedAuthor != vars["authorName"] {
				utils.WriteFailedResponse(http.StatusBadRequest, "author provided did not match order creator", w)
				return
			}

			err = models.AddOrderUserRelation(r.Context().Value(utils.UserId).(int64), convertedId)
			if err != nil {
				utils.WriteFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
				return
			}

			models.CacheOrderSession(convertedId, authorName)
		}

		r = r.WithContext(context.WithValue(r.Context(), controllers.OrderId, convertedId))

		handler.ServeHTTP(w, r)
	})
}
