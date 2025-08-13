package models

import (
	"MVC/pkg/database"
	"fmt"
	"strings"
)

func GetUserIdAuthorisationEmail(userEmail string) (int64, int, error) {
	var id int64
	var authorisation int
	err := database.DB.QueryRow("SELECT id, auth FROM Users WHERE email = ?;", userEmail).Scan(&id, &authorisation)

	return id, authorisation, err
}

func SetUserAuthorisation(userId int64, authorisation int) (bool, error) {
	res, err := database.DB.Exec("UPDATE Users SET auth = ? where id = ?;", authorisation, userId)
	if err != nil {
		return false, err
	}

	rowsAffected, err := res.RowsAffected()
	return rowsAffected > 0, err
}

func AddTag(tag string) error {
	res, err := database.DB.Exec("INSERT INTO FoodTags (name) VALUES (?);", tag)
	if err != nil {
		return err
	}

	_, err = res.LastInsertId()
	if err != nil {
		return err
	}

	ReloadTagCache()
	return nil
}

func UpdateFoodTags(foodId int64, tags []int64) error {
	_, err := database.DB.Exec("DELETE FROM FoodTagRelations WHERE foodId = ?;", foodId)
	if err != nil {
		return err
	}

	placeholders := make([]string, len(tags))
	values := make([]interface{}, len(tags)*2)
	for i, tag := range tags {
		values[i] = foodId
		values[i+1] = tag
		placeholders[i] = "(?, ?)"
	}

	query := fmt.Sprintf("INSERT INTO FoodTagRelations (foodID, tagID) VALUES %v;", strings.Join(placeholders, ","))
	_, err = database.DB.Exec(query, values...)

	if err != nil {
		return err
	}

	ReloadMenuCache()
	return nil
}

func AddFoodItem(name string, price uint, description string, vegetarian bool, cookTime string, image string) (int64, error) {
	res, err := database.DB.Exec("INSERT INTO Foods (name, price, description, veg, cookTime, image) VALUES (?, ?, ?, ?, ?, ?);", name, price, description, vegetarian, cookTime, image)
	if err != nil {
		return -1, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return 01, err
	}

	ReloadMenuCache()
	return id, err
}
