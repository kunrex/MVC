package controllers

import (
	"MVC/pkg/database/models"
	"MVC/pkg/utils"
	"encoding/json"
	"fmt"
	"net/http"
)

type paymentDetails struct {
	Tip      int     `json:"tip"`
	Total    float32 `json:"total"`
	Discount int     `json:"discount"`
	Subtotal float32 `json:"subtotal"`
}

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
				err := models.UpdateSuborder(element.SuborderExtra, orderId)
				if err != nil {
					utils.ReturnFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
					return
				}
			} else {
				err := models.DeleteSuborder(element.Id, orderId)
				if err != nil {
					utils.ReturnFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
					return
				}
			}
			break
		case 1:
			additions = append(additions, element.Suborder)
			break
		}
	}

	err := models.AddSuborders(additions, orderId, userId)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func CompleteOrderHandler(w http.ResponseWriter, r *http.Request) {
	orderId := r.Context().Value(OrderId).(int64)

	ok := models.CompleteOrder(orderId)
	if !ok {
		utils.ReturnFailedResponse(http.StatusInternalServerError, "failed to complete order", w)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func PayOrderHandler(w http.ResponseWriter, r *http.Request) {
	var details paymentDetails
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&details); err != nil {
		utils.ReturnFailedResponse(http.StatusBadRequest, "invalid request body format", w)
		return
	}

	userId := r.Context().Value(utils.UserId).(int64)
	orderId := r.Context().Value(OrderId).(int64)

	err := models.PayOrder(orderId, details.Subtotal, details.Tip, details.Discount, details.Total, userId)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
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
