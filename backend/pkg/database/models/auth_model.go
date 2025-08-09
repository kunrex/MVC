package models

import (
	"MVC/pkg/database"
)

func UserExistsEmail(email string) error {
	var temp string
	err := database.DB.QueryRow("SELECT 1 FROM Users WHERE email = ?;", email).Scan(&temp)
	return err
}

func CreateUser(name string, email string, passwordHash string) (int64, error) {
	result, err := database.DB.Exec("INSERT INTO Users (name, email, auth, pwdHash) Values (?, ?, ?, ?);", name, email, 1, passwordHash)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

func UserIdAuthorisationPasswordEmail(email string) (int64, int, string, error) {
	var id int64
	var authorisation int
	var hashedPassword string
	err := database.DB.QueryRow("SELECT id, auth, pwdHash FROM Users WHERE email = ?;", email).Scan(&id, &authorisation, &hashedPassword)

	if err != nil {
		return -1, -1, "", err
	}

	return id, authorisation, hashedPassword, nil
}
