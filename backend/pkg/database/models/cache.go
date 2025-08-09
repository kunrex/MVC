package models

import (
	"MVC/pkg/database"
	"MVC/pkg/types"
	"encoding/json"
	"log"
	"sync"
	"time"
)

var TagCacheString string
var MenuCacheString string

var tagsCache = make(map[string]int64)
var foodsCache = make(map[string]int64)

var orderSessionsCache = make(map[int64]types.OrderSessionCache)

type foodCache struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Price       uint   `json:"price"`
	Description string `json:"description"`
	Vegetarian  bool   `json:"vegetarian"`
	CookTime    string `json:"cookTime"`
	ImageURL    string `json:"imageURL"`
	Tags        string `json:"tags"`
}

var sessionsCacheMutex sync.Mutex

func ReloadTagCache() {
	rows, err := database.DB.Query("SELECT id, name FROM FoodTags;")
	if err != nil {
		log.Printf("SQL Error which caching tags: %v", err.Error())
	}

	var tags []string
	for rows.Next() {
		var id int64
		var tag string
		err = rows.Scan(&id, &tag)
		if err != nil {
			log.Printf("SQL Error which caching menu: %v", err.Error())
		}

		tagsCache[tag] = id

		tags = append(tags, tag)
	}

	jsonData, err := json.Marshal(tags)
	if err != nil {
		log.Printf("JSON Error which caching tags: %v", err.Error())
	}

	TagCacheString = string(jsonData)
}

func ReloadMenuCache() {
	rows, err := database.DB.Query(`SELECT Foods.id, Foods.name, Foods.description, Foods.veg, Foods.cookTime, Foods.price, Foods.image, IFNULL(GROUP_CONCAT(FoodTags.name ORDER BY FoodTags.id), '') AS tags FROM Foods
                                            LEFT JOIN FoodTagRelations ON Foods.id = FoodTagRelations.foodId
                                            LEFT JOIN FoodTags ON FoodTags.id = FoodTagRelations.tagId
                                            GROUP BY Foods.id
                                            ORDER BY Foods.id;`)
	if err != nil {
		log.Printf("SQL Error which caching menu: %v", err.Error())
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

		foodsCache[food.Name] = food.ID

		if err != nil {
			log.Printf("SQL Error which caching menu: %v", err.Error())
		}

		foods = append(foods, food)
	}

	jsonData, err := json.Marshal(foods)
	if err != nil {
		log.Printf("JSON Error which caching menu: %v", err.Error())
	}

	MenuCacheString = string(jsonData)
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

		return nil
	}

	return ids
}

func CacheOrderSession(orderId int64, authorName string) {
	sessionsCacheMutex.Lock()
	orderSessionsCache[orderId] = types.OrderSessionCache{
		AuthorName: authorName,
		ExpiresOn:  time.Now().Add(time.Minute * 5),
	}
	sessionsCacheMutex.Unlock()
}

func CheckOrderSessionCache(orderId int64, authorName string) (bool, bool) {
	sessionsCacheMutex.Lock()
	result, found := orderSessionsCache[orderId]
	sessionsCacheMutex.Unlock()
	return found, result.AuthorName == authorName
}

func ClearExpiredOrderSessions() {
	sessionsCacheMutex.Lock()
	for id, orderSession := range orderSessionsCache {
		if time.Now().After(orderSession.ExpiresOn) {
			delete(orderSessionsCache, id)
		}
	}
	sessionsCacheMutex.Unlock()
}
