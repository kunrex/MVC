package models

import (
	"MVC/pkg/database"
	"fmt"
	"strings"
	"time"
)

func GetUserAuthorisationEmail(userEmail string) (int, error) {
	var authorisation int
	err := database.DB.QueryRow("SELECT auth FROM users WHERE email = ?;", userEmail).Scan(&authorisation)

	return authorisation, err
}

func SetUserAuthorisation(userId int64, authorisation int) (bool, error) {
	res, err := database.DB.Exec("UPDATE Users SET auth = ? where id = ?;", authorisation, userId)
	if err != nil {
		return false, err
	}

	rowsAffected, err := res.RowsAffected()
	return rowsAffected > 0, err
}

func AddFoodTag(tag string) error {
	res, err := database.DB.Exec("INSERT INTO FoodTags (name) VALUES (?)", tag)
	if err != nil {
		return err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return err
	}

	AddTagCache(id, tag)
	return nil
}

func UpdateFoodTags(foodId int64, tags []int64) error {
	_, err := database.DB.Exec("DELETE FROM FoodTagRelations WHERE foodId = ?;", foodId)
	if err != nil {
		return err
	}

	placeholders := make([]string, len(tags))
	values := make([]interface{}, len(tags))
	for _, tag := range tags {
		placeholders = append(placeholders, "(?, ?)")
		values = append(values, foodId, tag)
	}

	query := fmt.Sprintf("INSERT INTO FoodTagRelations (foodID, tagID) VALUES %v", strings.Join(placeholders, ","))
	_, err = database.DB.Exec(query, values...)

	if err != nil {
		return err
	}

	UpdateFoodTagsCache(foodId, tags)
	return nil
}

func AddFoodItem(name string, price uint, description string, vegetarian bool, cookTime time.Time, image string) error {
	res, err := database.DB.Exec("INSERT INTO Foods (name, price, description, veg, cookTime, image) VALUES (?, ?, ?, ?, ?, ?);", name, price, description, vegetarian, cookTime, image)
	if err != nil {
		return err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return err
	}

	AddFoodCache(id, name)
	return err
}
