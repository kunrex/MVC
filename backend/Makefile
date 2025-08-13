include .env
export

run:
	go run cmd/main.go

build:
	go build cmd/main.go

migrate-up:
	migrate -path database/migrations -database "mysql://$(DB_USER):$(DB_PASSWORD)@tcp($(DB_HOST):3306)/$(DB_NAME)" up

migrate-down:
	migrate -path database/migrations -database "mysql://$(DB_USER):$(DB_PASSWORD)@tcp($(DB_HOST):3306)/$(DB_NAME)" down