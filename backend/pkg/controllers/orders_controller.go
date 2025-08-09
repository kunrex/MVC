package controllers

import (
	"MVC/pkg/database/models"
	"MVC/pkg/utils"
	"encoding/json"
	"fmt"
	"net/http"
)

type suborderUpdate struct {
	Code int `json:"code"`
	models.SuborderExtra
}

const OrderId utils.ContextKey = "orderId"

func NewOrderHandler(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value(utils.UserId).(int64)

	id, err := models.TryFindNonPayedOrder(userId)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(id)
}

func GetTagMenuCacheHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"tags": models.TagCacheString,
		"menu": models.MenuCacheString,
	})
}

func GetOrderDetailsHandler(w http.ResponseWriter, r *http.Request) {
	orderId := r.Context().Value(OrderId).(int64)

	completed, payed, err := models.GetOrderStatus(orderId)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]bool{
		"payed":     payed,
		"completed": completed,
	})
}

func GetSuborderDetailsHandler(w http.ResponseWriter, r *http.Request) {
	orderId := r.Context().Value(OrderId).(int64)
	jsonData, err := models.GetSuborders(orderId)

	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(jsonData)
}

func UpdateSubordersHandler(w http.ResponseWriter, r *http.Request) {
	var suborderUpdates []suborderUpdate
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&suborderUpdates); err != nil {
		utils.ReturnFailedResponse(http.StatusBadRequest, "invalid request body format", w)
		return
	}

	userId := r.Context().Value(utils.UserId).(int64)
	orderId := r.Context().Value(OrderId).(int64)

	var additions []models.Suborder
	for _, element := range suborderUpdates {
		switch element.Code {
		case 0:
			if element.Quantity > 0 {
				rowsAffected, err := models.UpdateSuborder(element.SuborderExtra, orderId)
				if err != nil {
					utils.ReturnFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
					return
				}
				if rowsAffected == 0 {
					utils.ReturnFailedResponse(http.StatusInternalServerError, "suborder does not exist or does not belong to order", w)
					return
				}
			} else {
				rowsAffected, err := models.DeleteSuborder(element.Id, orderId)
				if err != nil {
					utils.ReturnFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
					return
				}
				if rowsAffected == 0 {
					utils.ReturnFailedResponse(http.StatusInternalServerError, "suborder does not exist or does not belong to order", w)
					return
				}
			}
			break
		case 1:
			additions = append(additions, element.Suborder)
			break
		}
	}

	if len(additions) > 0 {
		err := models.AddSuborders(additions, orderId, userId)
		if err != nil {
			utils.ReturnFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
}

func CompleteOrderHandler(w http.ResponseWriter, r *http.Request) {
	orderId := r.Context().Value(OrderId).(int64)

	ok, err := models.CompleteOrder(orderId)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, err.Error(), w)
		return
	}
	if !ok {
		utils.ReturnFailedResponse(http.StatusBadRequest, "order is already marked completed", w)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func PayOrderHandler(w http.ResponseWriter, r *http.Request) {
	var tip int
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&tip); err != nil {
		utils.ReturnFailedResponse(http.StatusBadRequest, "invalid request body format", w)
		return
	}

	userId := r.Context().Value(utils.UserId).(int64)
	orderId := r.Context().Value(OrderId).(int64)

	subtotal, err := models.CalculateOrderSubtotal(orderId)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusBadRequest, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	discount := 0
	if subtotal > 2000 {
		discount = 10
	} else if subtotal > 1000 {
		discount = 5
	}

	ok, err := models.PayOrder(orderId, float32(subtotal), tip, discount, float32(subtotal)*float32(discount)*0.01+float32(tip), userId)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}
	if !ok {
		utils.ReturnFailedResponse(http.StatusBadRequest, "order is already payed for", w)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func GetIncompleteSubordersHandler(w http.ResponseWriter, r *http.Request) {
	jsonData, err := models.GetIncompleteSuborders()
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(jsonData)
}

func GetAllOrdersHandler(w http.ResponseWriter, r *http.Request) {
	jsonData, err := models.GetAllOrders()
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(jsonData)
}

func GetUserOrdersHandler(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value(utils.UserId).(int64)

	jsonData, err := models.GetUserOrders(userId)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(jsonData)
}
