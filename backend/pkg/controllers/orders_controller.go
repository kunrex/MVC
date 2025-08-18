package controllers

import (
	"MVC/pkg/database/models"
	"MVC/pkg/types"
	"MVC/pkg/utils"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
)

const OrderId utils.ContextKey = "orderId"

func NewOrderHandler(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value(utils.UserId).(int64)

	id, err := models.TryFindNonPayedOrder(userId)
	if err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(types.OrderCreateResponse{
		Id: id,
	})
}

func GetTagMenuCacheHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(types.MenuTagCacheResponse{
		Tags: models.TagCacheString,
		Menu: models.MenuCacheString,
	})
}

func GetOrderDetailsHandler(w http.ResponseWriter, r *http.Request) {
	orderId := r.Context().Value(OrderId).(int64)

	completed, payed, err := models.GetOrderStatus(orderId)
	if err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(types.OrderDetailsResponse{
		Payed:     payed,
		Completed: completed,
	})
}

func GetSuborderDetailsHandler(w http.ResponseWriter, r *http.Request) {
	orderId := r.Context().Value(OrderId).(int64)
	jsonData, err := models.GetSuborders(orderId)

	if err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(jsonData)
}

func updateSuborder(suborder *types.SuborderExtra, orderId int64) error {
	rowsAffected, err := models.UpdateSuborder(suborder, orderId)
	if err != nil {
		return errors.New(fmt.Sprintf("SQL Error: %v", err.Error()))
	}
	if rowsAffected == 0 {
		return errors.New(fmt.Sprintf("suborder does not exist or does not belong to order"))
	}

	return nil
}

func deleteSuborder(suborderId int64, orderId int64) error {
	rowsAffected, err := models.DeleteSuborder(suborderId, orderId)
	if err != nil {
		return errors.New(fmt.Sprintf("SQL Error: %v", err.Error()))
	}
	if rowsAffected == 0 {
		return errors.New(fmt.Sprintf("suborder does not exist or does not belong to order"))
	}

	return nil
}

func UpdateSubordersHandler(w http.ResponseWriter, r *http.Request) {
	var suborderUpdates []types.SuborderUpdateForm
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&suborderUpdates); err != nil {
		utils.WriteFailedResponse(http.StatusBadRequest, "invalid request body format", w)
		return
	}

	userId := r.Context().Value(utils.UserId).(int64)
	orderId := r.Context().Value(OrderId).(int64)

	var additions []types.Suborder
	for _, element := range suborderUpdates {
		switch {
		case element.Code == 0 && element.Quantity > 0:
			err := updateSuborder(&element.SuborderExtra, orderId)
			if err != nil {
				utils.WriteFailedResponse(http.StatusInternalServerError, err.Error(), w)
				return
			}
			break
		case element.Code == 0 && element.Quantity <= 0:
			err := deleteSuborder(element.Id, orderId)
			if err != nil {
				utils.WriteFailedResponse(http.StatusInternalServerError, err.Error(), w)
				return
			}
			break
		case element.Code == 1 && element.Quantity > 0:
			additions = append(additions, element.Suborder)
			break
		case element.Code == 1 && element.Quantity == 0:
			break
		default:
			utils.WriteFailedResponse(http.StatusBadRequest, "invalid request body format", w)
			return
		}
	}

	if len(additions) > 0 {
		err := models.AddSuborders(additions, orderId, userId)
		if err != nil {
			utils.WriteFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
}

func CompleteOrderHandler(w http.ResponseWriter, r *http.Request) {
	orderId := r.Context().Value(OrderId).(int64)

	ok, err := models.CompleteOrder(orderId)
	if err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, err.Error(), w)
		return
	}
	if !ok {
		utils.WriteFailedResponse(http.StatusBadRequest, "order is already marked completed", w)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func PayOrderHandler(w http.ResponseWriter, r *http.Request) {
	var payment types.PayOrderForm
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&payment); err != nil {
		utils.WriteFailedResponse(http.StatusBadRequest, "invalid request body format", w)
		return
	}

	userId := r.Context().Value(utils.UserId).(int64)
	orderId := r.Context().Value(OrderId).(int64)

	subtotal, err := models.CalculateOrderSubtotal(orderId)
	if err != nil {
		utils.WriteFailedResponse(http.StatusBadRequest, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	discount := utils.CalculateDiscount(subtotal)
	total := subtotal*float32(discount)*0.01 + float32(payment.Tip)

	paymentRegistered, err := models.PayOrder(orderId, subtotal, payment.Tip, discount, total, userId)
	if err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}
	if !paymentRegistered {
		utils.WriteFailedResponse(http.StatusBadRequest, "order is already payed for", w)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func GetIncompleteSubordersHandler(w http.ResponseWriter, r *http.Request) {
	jsonData, err := models.GetIncompleteSuborders()
	if err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(jsonData)
}

func UpdateIncompleteSubordersHandler(w http.ResponseWriter, r *http.Request) {
	var suborderUpdates []types.SuborderExtra
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&suborderUpdates); err != nil {
		fmt.Println(err.Error())
		utils.WriteFailedResponse(http.StatusBadRequest, "invalid request body format", w)
		return
	}

	for _, element := range suborderUpdates {
		rowsAffected, err := models.UpdateSuborderStatus(&element)
		if err != nil {
			utils.WriteFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
			return
		}
		if rowsAffected == 0 {
			utils.WriteFailedResponse(http.StatusBadRequest, "suborder does not exist", w)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
}

func GetAllOrdersHandler(w http.ResponseWriter, r *http.Request) {
	jsonData, err := models.GetAllOrders()
	if err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(jsonData)
}

func GetUserOrdersHandler(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value(utils.UserId).(int64)

	jsonData, err := models.GetUserOrders(userId)
	if err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(jsonData)
}
