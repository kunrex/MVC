package controllers

import (
	"MVC/pkg/database/models"
	"MVC/pkg/utils"
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"regexp"
)

var emailRegex, _ = regexp.Compile("^[^\\s@]+@[^\\s@]+$")

func sanitizeLoginUser(email string, password string) (bool, string) {
	if !emailRegex.MatchString(email) {
		return false, "email was invalid"
	}

	if !utils.Between(len(email), 1, 255) {
		return false, "maximum email length is 255 characters"
	}

	if !utils.Between(len(password), 1, utils.MaxLength) {
		return false, "maximum password length is max 72 characters"
	}

	return true, ""
}

func sanitizeCreateUser(name string, email string, password string) (bool, string) {
	if !utils.Between(len(name), 1, 100) {
		return false, "maximum username length is 100 characters"
	}

	return sanitizeLoginUser(email, password)
}

func RegisterUserHandler(w http.ResponseWriter, r *http.Request) {
	name := r.Form.Get("name")
	email := r.Form.Get("email")
	password := r.Form.Get("password")

	if ok, errStr := sanitizeCreateUser(name, email, password); !ok {
		utils.WriteFailedResponse(http.StatusBadRequest, errStr, w)
		return
	}

	if err := models.UserExistsEmail(email); err != nil && !errors.Is(err, sql.ErrNoRows) {
		utils.WriteFailedResponse(http.StatusBadRequest, "user already exists", w)
		return
	}

	hashedPasswordBytes, err := utils.HashPassword(password)
	if err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, "failed to hash password", w)
		return
	}

	hashedPassword := string(hashedPasswordBytes)

	insertId, err := models.CreateUser(name, email, hashedPassword)
	if err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
		return
	}

	accessToken, err := utils.GenerateAccessToken(insertId, 1)
	if err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, "failed to generate access token", w)
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(insertId, 1)
	if err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, "failed to generate refresh token", w)
		return
	}

	if err = models.SetRefreshHash(insertId, utils.HashToken(refreshToken)); err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, fmt.Sprintf("SQL Error: %v", err.Error()), w)
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
	email := r.Form.Get("email")
	password := r.Form.Get("password")

	if ok, errStr := sanitizeLoginUser(email, password); !ok {
		utils.WriteFailedResponse(http.StatusBadRequest, errStr, w)
		return
	}

	id, authorisation, passwordHash, err := models.UserIdAuthorisationPasswordEmail(email)
	if err != nil {
		utils.WriteFailedResponse(http.StatusUnauthorized, "user does not exist, please sign up", w)
		return
	}

	err = utils.ComparePasswordHash(password, []byte(passwordHash))
	if err != nil {
		utils.WriteFailedResponse(http.StatusBadRequest, "email or password was incorrect", w)
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(id, authorisation)
	if err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, "failed to generate refresh token", w)
		return
	}

	if err = models.SetRefreshHash(id, utils.HashToken(refreshToken)); err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, "failed to update refresh token", w)
		return
	}

	accessToken, err := utils.GenerateAccessToken(id, authorisation)
	if err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, "failed to generate access token", w)
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

func AuthoriseUserHandler(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		utils.WriteFailedResponse(http.StatusBadRequest, "invalid request body format", w)
		return
	}

	action := r.Form.Get("action")

	if action == "login" {
		LoginUserHandler(w, r)
	} else if action == "signup" {
		RegisterUserHandler(w, r)
	} else {
		utils.WriteFailedResponse(http.StatusBadRequest, "invalid action", w)
	}
}

func AuthRefreshHandler(w http.ResponseWriter, r *http.Request) {
	refreshCookie, err := r.Cookie(utils.RefreshCookie)
	if err != nil {
		utils.WriteFailedResponse(http.StatusUnauthorized, "failed to get refresh token, please log in again", w)
		return
	}

	id, cookieAuthorisation, err := utils.VerifyToken(refreshCookie.Value)
	if err != nil {
		utils.WriteFailedResponse(http.StatusUnauthorized, "refresh token expired, please log in again", w)
		return
	}

	authorisation, err := models.UserAuthorisation(id)
	if err != nil {
		utils.WriteFailedResponse(http.StatusUnauthorized, "no such user exists, please sign up", w)
		return
	}

	if authorisation != cookieAuthorisation {
		utils.WriteFailedResponse(http.StatusUnauthorized, "authorisation level changed, please log in again", w)
		return
	}

	accessToken, err := utils.GenerateAccessToken(id, authorisation)
	if err != nil {
		utils.WriteFailedResponse(http.StatusInternalServerError, "failed to generate access token", w)
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
