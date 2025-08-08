package models

import (
	"MVC/pkg/database"
	"encoding/json"
	"time"
)

var TagCacheString string
var MenuCacheString string

var tagsCache map[string]int64
var foodsCache map[string]int64

type foodCache struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Price       uint      `json:"price"`
	Description string    `json:"description"`
	Vegetarian  bool      `json:"vegetarian"`
	CookTime    time.Time `json:"cookTime"`
	ImageURL    string    `json:"imageURL"`
	Tags        string    `json:"tags"`
}

func reloadTagCache() {
	rows, err := database.DB.Query("SELECT name FROM FoodTags;")
	if err != nil {
		return
	}

	var tags []string
	for rows.Next() {
		var tag string
		err = rows.Scan(&tag)
		if err != nil {
			return
		}

		tags = append(tags, tag)
	}

	jsonData, err := json.Marshal(tags)
	if err != nil {
		return
	}

	TagCacheString = string(jsonData)
}

func ReloadMenuCache() {
	rows, err := database.DB.Query(`SELECT Foods.id, Foods.name, Foods.description, Foods.veg, Foods.cookTime, Foods.price, Foods.image, IFNULL(GROUP_CONCAT(FoodTags.name ORDER BY FoodTags.id), '') AS tags FROM ${foods}
                                            LEFT JOIN FoodTagRelations ON Foods.id = FoodTagRelations.foodId
                                            LEFT JOIN FoodTags ON FoodTags.id = FoodTagRelations.tagId
                                            GROUP BY Foods.id
                                            ORDER BY Foods.id;`)
	if err != nil {
		return
	}

	var foods []foodCache
	for rows.Next() {
		var food foodCache
		err = rows.Scan(
			&food.ID,
			&food.Name,
			&food.Description,
			&food.Vegetarian,
			&food.CookTime,
			&food.Price,
			&food.ImageURL,
			&food.Tags)

		if err != nil {
			return
		}

		foods = append(foods, food)
	}

	jsonData, err := json.Marshal(foods)
	if err != nil {
		return
	}

	MenuCacheString = string(jsonData)
}

func AddTagCache(id int64, tag string) {
	tagsCache[tag] = id
	reloadTagCache()
}

func AddFoodCache(id int64, name string) {
	tagsCache[name] = id
	ReloadMenuCache()
}

func CheckTagCache(tag string) bool {
	_, exists := tagsCache[tag]
	return exists
}

func CheckFoodCache(name string) bool {
	_, found := foodsCache[name]
	return found
}

func CheckFoodIDCache(id int64) bool {
	for _, item := range foodsCache {
		if item == id {
			return true
		}
	}

	return false
}

func MapTagIDsCache(tags []string) []int64 {
	ids := make([]int64, len(tags))

	for i, tag := range tags {
		if id, found := tagsCache[tag]; found {
			ids[i] = id
			continue
		}

		break
	}

	return nil
}
