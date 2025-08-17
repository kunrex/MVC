package types

type UserDetailsResponse struct {
	Name  string `json:"name"`
	Chef  bool   `json:"chef"`
	Admin bool   `json:"admin"`
}

type SignUpResponse struct {
	AWT string `json:"awt"`
}

type LoginResponse struct {
	SignUpResponse
	UserDetailsResponse
}

type AddFoodResponse struct {
	Id int64 `json:"id"`
}

type MenuTagCacheResponse struct {
	Tags string `json:"tags"`
	Menu string `json:"menu"`
}

type OrderCreateResponse struct {
	Id int64 `json:"id"`
}

type OrderDetailsResponse struct {
	Payed     bool `json:"payed"`
	Completed bool `json:"completed"`
}
