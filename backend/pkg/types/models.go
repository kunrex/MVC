package types

import "time"

type Order struct {
	Id         int64     `json:"id"`
	CreatedOn  time.Time `json:"createdOn"`
	AuthorName string    `json:"authorName"`
	Completed  bool      `json:"completed"`
}

type Suborder struct {
	FoodId   int64  `json:"foodId"`
	FoodName string `json:"foodName"`
	FoodPrice uint `json:"foodPrice"`

	Status string `json:"status"`

	Quantity     int    `json:"quantity"`
	Instructions string `json:"instructions"`
}

type SuborderExtra struct {
	Id         int64  `json:"id"`
	AuthorName string `json:"authorName"`

	Suborder
}

type OrderSessionCache struct {
	AuthorName string
	ExpiresOn  time.Time
}
