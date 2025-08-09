package types

type FoodTagsUpdateForm struct {
	FoodId int64    `json:"foodId"`
	Tags   []string `json:"tags"`
}

type AddNewFoodForm struct {
	Name        string `json:"name"`
	Price       uint   `json:"price"`
	Description string `json:"description"`
	Vegetarian  bool   `json:"vegetarian"`
	CookTime    string `json:"cookTime"`
	ImageURL    string `json:"imageURL"`
}

type SuborderUpdateForm struct {
	Code int `json:"code"`
	SuborderExtra
}
