package controllers

import (
	"MVC/pkg/database/models"
	"MVC/pkg/types"
	"MVC/pkg/utils"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"path/filepath"
	"regexp"
	"strconv"
)

var timeRegex, _ = regexp.Compile("^(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$")

func GetAllAuthorisationsHandler(w http.ResponseWriter, r *http.Request) {
	users, err := models.GetAllUserAuthorisations()
	if err != nil {
		utils.WriteFailedResponse(http.StatusBadRequest, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(users)
}

func SetUserAuthorisationHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userId := vars["userId"]
	newAuthorisation := vars["authorisation"]

	convertedId, err := strconv.ParseInt(userId, 10, 64)
	if err != nil {
		utils.WriteFailedResponse(http.StatusBadRequest, "invalid id", w)
		return
	}

	convertedAuthorisation, err := strconv.Atoi(newAuthorisation)
	if err != nil || !utils.Between(convertedAuthorisation, 1, 7) {
		utils.WriteFailedResponse(http.StatusBadRequest, "invalid authorisation", w)
		return
	}

	affected, err := models.SetUserAuthorisation(convertedId, convertedAuthorisation)
	if err != nil || !affected {
		utils.WriteFailedResponse(http.StatusBadRequest, "no such user exists", w)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func AddTagHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	newTag := vars["tag"]

	if !utils.Between(len(newTag), 1, 50) {
		utils.WriteFailedResponse(http.StatusBadRequest, "maximum tag length is 50", w)
		return
	}

	if models.CheckTagCache(newTag) {
		utils.WriteFailedResponse(http.StatusBadRequest, "tag already exists", w)
		return
	}

	err := models.AddTag(newTag)
	if err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func UpdateFoodTagHandler(w http.ResponseWriter, r *http.Request) {
	var foodTagsForm types.FoodTagsUpdateForm
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&foodTagsForm); err != nil {
		utils.WriteFailedResponse(http.StatusBadRequest, "invalid request body format", w)
		return
	}

	if !models.CheckFoodIDCache(foodTagsForm.FoodId) {
		utils.WriteFailedResponse(http.StatusBadRequest, "no such food", w)
		return
	}

	tagIds := models.MapTagIDsCache(foodTagsForm.Tags)
	if tagIds == nil {
		utils.WriteFailedResponse(http.StatusBadRequest, "tags passed were invalid", w)
		return
	}

	err := models.UpdateFoodTags(foodTagsForm.FoodId, tagIds)
	if err != nil {
		utils.WriteFailedResponse(http.StatusBadRequest, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func AddFoodHandler(w http.ResponseWriter, r *http.Request) {
	var newFoodForm types.AddNewFoodForm
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&newFoodForm); err != nil {
		utils.WriteFailedResponse(http.StatusBadRequest, "invalid request body format", w)
		return
	}

	if !timeRegex.MatchString(newFoodForm.CookTime) {
		utils.WriteFailedResponse(http.StatusBadRequest, "invalid request body format", w)
		return
	}

	if models.CheckFoodCache(newFoodForm.Name) {
		utils.WriteFailedResponse(http.StatusBadRequest, "food already exists", w)
		return
	}

	if !utils.Between(len(newFoodForm.Name), 1, 100) {
		utils.WriteFailedResponse(http.StatusBadRequest, "maximum name length is 100 characters", w)
		return
	}

	if !utils.Between(len(newFoodForm.Description), 1, 300) {
		utils.WriteFailedResponse(http.StatusBadRequest, "maximum description length is 300 characters", w)
		return
	}

	path := filepath.Join("assets/", fmt.Sprintf("%v.jpeg", newFoodForm.Name))
	err := utils.DownloadImage(newFoodForm.ImageURL, path)
	if err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, fmt.Sprintf("error downloading image: %v", err.Error()), w)
		return
	}

	id, err := models.AddFoodItem(newFoodForm.Name, newFoodForm.Price, newFoodForm.Description, newFoodForm.Vegetarian, newFoodForm.CookTime, path)
	if err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(id)
}
