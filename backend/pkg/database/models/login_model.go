package models

import (
	"MVC/pkg/database"
)

func UserExistsEmail(email string) error {
	err := database.DB.QueryRow("SELECT 1 FROM Users WHERE email = ?;", email).Scan()
	return err
}

func CreateUser(name string, email string, passwordHash string) (int64, error) {
	result, err := database.DB.Exec("INSERT INTO Users (name, email, auth, pwdHash, refreshHash) Values (?, ?, ?, ?);", name, email, 1, passwordHash, nil)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

func SetRefreshHash(orderId int64, refreshHash string) error {
	_, err := database.DB.Exec("UPDATE Users SET refreshHash = ? WHERE id = ?", refreshHash, orderId)
	return err
}

func UserIdPasswordAuthorisationEmail(email string) (int64, int, string, error) {
	var id int64
	var authorisation int
	var hashedPassword string
	err := database.DB.QueryRow("SELECT id, auth, pwdHash FROM Users WHERE email = ?;", email).Scan(&id, &authorisation, &hashedPassword)

	if err != nil {
		return -1, -1, "", err
	}

	return id, authorisation, hashedPassword, nil
}

func UserAuthorisation(id int64) (int, error) {
	var authorisation int
	err := database.DB.QueryRow("SELECT auth FROM Users WHERE id = ?;", id).Scan(&authorisation)

	if err != nil {
		return -1, err
	}

	return authorisation, nil
}

func SignOutUser(id int64) error {
	_, err := database.DB.Exec("UPDATE Users SET refreshHash = NULL WHERE id = ?;", id)
	return err
}
