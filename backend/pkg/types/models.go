package types

import "time"

type Order struct {
	Id         int64  `json:"id"`
	CreatedOn  string `json:"createdOn"`
	AuthorName string `json:"authorName"`
	Completed  bool   `json:"completed"`
	Paid       bool   `json:"paid"`
}

type Suborder struct {
	FoodId    int64  `json:"foodId"`
	FoodName  string `json:"foodName"`
	FoodPrice uint   `json:"foodPrice"`

	Status string `json:"status"`

	Quantity     int    `json:"quantity"`
	Instructions string `json:"instructions"`
}

type SuborderExtra struct {
	Id         int64  `json:"id"`
	AuthorName string `json:"authorName"`
	OrderId    int64  `json:"orderId"`

	Suborder
}

type OrderSessionCache struct {
	AuthorName string
	ExpiresOn  time.Time
}

type FoodCache struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Price       uint   `json:"price"`
	Description string `json:"description"`
	Vegetarian  bool   `json:"vegetarian"`
	CookTime    string `json:"cookTime"`
	ImageURL    string `json:"imageURL"`
	Tags        string `json:"tags"`
}

type UserAuthorisation struct {
	Id			  int64  `json:"id"`
	Name          string `json:"name"`
	Email         string `json:"email"`
	Authorisation uint   `json:"authorisation"`
}
