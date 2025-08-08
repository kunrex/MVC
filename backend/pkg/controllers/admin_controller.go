package controllers

import (
	"MVC/pkg/database/models"
	"MVC/pkg/utils"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"
)

type foodTagsUpdateForm struct {
	FoodID int64    `json:"foodID"`
	Tags   []string `json:"tags"`
}

type addNewFoodForm struct {
	Name        string    `json:"name"`
	Price       uint      `json:"price"`
	Description string    `json:"description"`
	Vegetarian  bool      `json:"vegetarian"`
	CookTime    time.Time `json:"cookTime"`
	ImageURl    string    `json:"imageURl"`
}

func GetUserAuthorisationHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userEmail := vars["userEmail"]

	authorisation, err := models.GetUserAuthorisationEmail(userEmail)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusBadRequest, "no such user exists", w)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]int{
		"authorisation": authorisation,
	})
}

func SetUserAuthorisationHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userId := vars["userId"]
	newAuthorisation := vars["authorisation"]

	convertedId, err := strconv.ParseInt(userId, 10, 64)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusBadRequest, "invalid id", w)
		return
	}

	convertedAuthorisation, err := strconv.Atoi(newAuthorisation)
	if err != nil || !utils.Between(convertedAuthorisation, 1, 7) {
		utils.ReturnFailedResponse(http.StatusBadRequest, "invalid authorisation", w)
		return
	}

	affected, err := models.SetUserAuthorisation(convertedId, convertedAuthorisation)
	if err != nil || !affected {
		utils.ReturnFailedResponse(http.StatusBadRequest, "no such user exists", w)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func AddTagHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	newTag := vars["tag"]

	if !utils.Between(len(newTag), 1, 50) {
		utils.ReturnFailedResponse(http.StatusBadRequest, "maximum tag length is 50", w)
		return
	}

	if models.CheckDuplicateTag(newTag) {
		utils.ReturnFailedResponse(http.StatusBadRequest, "tag already exists", w)
		return
	}

	err := models.AddFoodTag(newTag)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func UpdateFoodTagHandler(w http.ResponseWriter, r *http.Request) {
	var foodTagsForm foodTagsUpdateForm
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&foodTagsForm); err != nil {
		utils.ReturnFailedResponse(http.StatusBadRequest, "invalid request body format", w)
		return
	}

	if !models.ExistsFoodCacheId(foodTagsForm.FoodID) {
		utils.ReturnFailedResponse(http.StatusBadRequest, "no such food", w)
		return
	}

	tagIds := models.GetTagIDCache(foodTagsForm.Tags)
	if tagIds == nil {
		utils.ReturnFailedResponse(http.StatusBadRequest, "tags passed were invalid", w)
		return
	}

	err := models.UpdateFoodTags(foodTagsForm.FoodID, tagIds)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusBadRequest, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func downloadImage(url string, imgPath string) error {
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
		return err
	}

	_, err = io.Copy(out, resp.Body)
	return err
}

func AddFoodHandler(w http.ResponseWriter, r *http.Request) {
	var newFoodForm addNewFoodForm
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&newFoodForm); err != nil {
		utils.ReturnFailedResponse(http.StatusBadRequest, "invalid request body format", w)
		return
	}

	if models.ExistsFoodCacheName(newFoodForm.Name) {
		utils.ReturnFailedResponse(http.StatusBadRequest, "food already exists", w)
		return
	}

	if !utils.Between(len(newFoodForm.Name), 0, 100) {
		utils.ReturnFailedResponse(http.StatusBadRequest, "maximum length of name is 100 characters", w)
		return
	}

	if !utils.Between(len(newFoodForm.Description), 0, 300) {
		utils.ReturnFailedResponse(http.StatusBadRequest, "maximum length of description is 300 characters", w)
		return
	}

	path := filepath.Join("assets/", fmt.Sprintf("%v.jpeg", newFoodForm.Name))
	err := downloadImage(newFoodForm.ImageURl, path)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, fmt.Sprintf("error downloading image: %v", err.Error()), w)
		return
	}

	err = models.AddFoodItem(newFoodForm.Name, newFoodForm.Price, newFoodForm.Description, newFoodForm.Vegetarian, newFoodForm.CookTime, path)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	w.WriteHeader(http.StatusOK)
}
