package controllers

import (
	"MVC/pkg/database/models"
	"MVC/pkg/utils"
	"encoding/json"
	"net/http"
)

func sanitizeLoginUser(email string, password string) (bool, string) {
	if !utils.EmailRegex.MatchString(email) {
		return false, "email was invalid"
	}

	if !utils.Between(len(email), 1, 255) {
		return false, "email can be of max 255 characters"
	}

	if !utils.Between(len(password), 1, utils.MaxLength) {
		return false, "password can be of max 72 characters"
	}

	return true, ""
}

func sanitizeCreateUser(name string, email string, password string) (bool, string) {
	if !utils.Between(len(name), 1, 100) {
		return false, "username can be of max 100 characters"
	}

	return sanitizeLoginUser(email, password)
}

func RegisterUserHandler(w http.ResponseWriter, r *http.Request) {
	name := r.FormValue("name")
	email := r.FormValue("email")
	password := r.FormValue("password")

	if ok, errStr := sanitizeCreateUser(name, email, password); !ok {
		utils.ReturnFailedResponse(http.StatusBadRequest, errStr, w)
		return
	}

	if err := models.UserExistsEmail(email); err != nil {
		utils.ReturnFailedResponse(http.StatusBadRequest, "user already exists", w)
		return
	}

	hashedPasswordBytes, err := utils.Hash(password)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, "Failed to hash password", w)
		return
	}

	hashedPassword := string(hashedPasswordBytes)

	insertId, err := models.CreateUser(name, email, hashedPassword)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, err.Error(), w)
		return
	}

	accessToken, err := utils.GenerateAccessToken(insertId, 1)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, "failed to generate access token", w)
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(insertId, 1)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, "failed to generate refresh token", w)
		return
	}

	hashedRefreshTokenBytes, err := utils.Hash(refreshToken)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, "Failed to hash refresh token", w)
		return
	}

	if err = models.SetRefreshHash(insertId, string(hashedRefreshTokenBytes)); err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, err.Error(), w)
		return
	}

	accessCookie := &http.Cookie{
		Name:  utils.AccessCookie,
		Value: accessToken,
		Path:  "/",
	}

	refreshCookie := &http.Cookie{
		Name:  utils.RefreshCookie,
		Value: refreshToken,
		Path:  "/",
	}

	http.SetCookie(w, accessCookie)
	http.SetCookie(w, refreshCookie)

	w.WriteHeader(http.StatusOK)
}

func LoginUserHandler(w http.ResponseWriter, r *http.Request) {
	email := r.FormValue("email")
	password := r.FormValue("password")

	if ok, errStr := sanitizeLoginUser(email, password); !ok {
		utils.ReturnFailedResponse(http.StatusBadRequest, errStr, w)
		return
	}

	id, authorisation, passwordHash, err := models.UserIdPasswordAuthorisationEmail(email)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusUnauthorized, "user does not exist, please sign up", w)
		return
	}

	err = utils.CompareHash(password, []byte(passwordHash))
	if err != nil {
		utils.ReturnFailedResponse(http.StatusBadRequest, "email or password was incorrect", w)
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(id, authorisation)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, "failed to generate refresh token", w)
		return
	}

	hashedRefreshTokenBytes, err := utils.Hash(refreshToken)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, "failed to hash refresh token", w)
		return
	}

	if err := models.SetRefreshHash(id, string(hashedRefreshTokenBytes)); err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, "failed to update refresh token", w)
		return
	}

	accessToken, err := utils.GenerateAccessToken(id, authorisation)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, "failed to generate access token", w)
		return
	}

	accessCookie := &http.Cookie{
		Name:  utils.AccessCookie,
		Value: accessToken,
		Path:  "/",
	}

	refreshCookie := &http.Cookie{
		Name:  utils.RefreshCookie,
		Value: refreshToken,
		Path:  "/",
	}

	http.SetCookie(w, accessCookie)
	http.SetCookie(w, refreshCookie)

	w.WriteHeader(http.StatusOK)
}

func SignOutUserHandler(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value(utils.UserId).(int64)

	if err := models.SignOutUser(userId); err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, "Failed to sign out user", w)
		return
	}

	accessCookie := &http.Cookie{
		Name:  utils.AccessCookie,
		Value: "",
		Path:  "/",
	}

	refreshCookie := &http.Cookie{
		Name:  utils.RefreshCookie,
		Value: "",
		Path:  "/",
	}

	http.SetCookie(w, accessCookie)
	http.SetCookie(w, refreshCookie)

	w.WriteHeader(http.StatusOK)
}

func AuthRefreshHandler(w http.ResponseWriter, r *http.Request) {
	refreshCookie, err := r.Cookie(utils.RefreshCookie)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusUnauthorized, "failed to get refresh token, please log in again", w)
		return
	}

	id, cookieAuthorisation, err := utils.VerifyToken(refreshCookie.Value)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusUnauthorized, "refresh token expired, please log in again", w)
		return
	}

	authorisation, err := models.UserAuthorisation(id)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusUnauthorized, "no such user exists, please sign up", w)
		return
	}

	if authorisation != cookieAuthorisation {
		utils.ReturnFailedResponse(http.StatusUnauthorized, "authorisation level changed, please log in again", w)
		return
	}

	accessToken, err := utils.GenerateAccessToken(id, authorisation)
	if err != nil {
		utils.ReturnFailedResponse(http.StatusInternalServerError, "failed to generate access token", w)
		return
	}

	accessCookie := &http.Cookie{
		Name:  utils.AccessCookie,
		Value: accessToken,
		Path:  "/",
	}

	http.SetCookie(w, accessCookie)
	w.WriteHeader(http.StatusOK)
}

func GetAuthorisationHandler(w http.ResponseWriter, r *http.Request) {
	authorisation := r.Context().Value(utils.UserAuthorisation).(int)

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]bool{
		"chef":  (authorisation & 2) == 2,
		"admin": (authorisation & 4) == 4,
	})
}
