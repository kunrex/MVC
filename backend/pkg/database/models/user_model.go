package models

import "MVC/pkg/database"

func UserAuthorisation(userId int64) (int, error) {
	var authorisation int
	err := database.DB.QueryRow("SELECT auth FROM Users WHERE id = ?;", userId).Scan(&authorisation)

	if err != nil {
		return -1, err
	}

	return authorisation, nil
}
