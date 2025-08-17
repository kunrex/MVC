DB_HOST := $(shell jq -r '.dbHost' config.json)
DB_NAME := $(shell jq -r '.dbName' config.json)

DB_USER := $(shell jq -r '.dbUser' config.json)
DB_PASSWORD := $(shell jq -r '.dbPassword' config.json)


run:
	go run cmd/main.go

build:
	go build cmd/main.go

migrate-up:
	migrate -path database/migrations -database "mysql://$(DB_USER):$(DB_PASSWORD)@tcp($(DB_HOST):3306)/$(DB_NAME)" up

migrate-down:
	migrate -path database/migrations -database "mysql://$(DB_USER):$(DB_PASSWORD)@tcp($(DB_HOST):3306)/$(DB_NAME)" down