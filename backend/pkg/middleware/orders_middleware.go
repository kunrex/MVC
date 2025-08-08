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

func GetOrderMiddleware(handler http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		orderId := vars["orderId"]

		convertedId, err := strconv.ParseInt(orderId, 10, 64)
		if err != nil {
			utils.ReturnFailedResponse(http.StatusBadRequest, "invalid order id", w)
			return
		}

		expectedAuthor, err := models.GetSuborderAuthor(convertedId)
		if err != nil {
			utils.ReturnFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
			return
		}

		if expectedAuthor != vars["authorName"] {
			utils.ReturnFailedResponse(http.StatusBadRequest, "author provided did not match order creator", w)
			return
		}

		err = models.AddOrderUserRelation(r.Context().Value(utils.UserId).(int64), convertedId)
		if err != nil {
			utils.ReturnFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
			return
		}

		ctx := context.WithValue(r.Context(), controllers.OrderId, convertedId)
		ctx = context.WithValue(ctx, controllers.Readonly, false)
		r = r.WithContext(ctx)
		handler.ServeHTTP(w, r)
	})
}