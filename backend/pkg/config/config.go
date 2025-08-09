package config

import (
	"MVC/pkg/types"
	"github.com/joho/godotenv"
	"log"
	"os"
	"strconv"
)

var TimeZoneMinutes int

func readString(envVariable string, address *string) bool {
	temp := os.Getenv(envVariable)
	if temp == "" {
		log.Printf("%v is empty", envVariable)
		return false
	}

	*address = temp
	return true
}

func readInt(envVariable string, address *int) bool {
	temp, err := strconv.Atoi(os.Getenv(envVariable))
	if err != nil {
		log.Printf("error converting %v to int: %v", envVariable, err.Error())
		return false
	}

	*address = temp
	return true
}

func InitConfig() *types.Config {
	var config types.Config

	err := godotenv.Load()
	if err != nil {
		log.Printf("error loading .env file: %v", err.Error())
		return nil
	}

	if !readInt("APP_PORT", &config.AppPort) ||
		!readInt("SALT_ROUNDS", &config.SaltRounds) ||
		!readString(os.Getenv("DB_HOST"), &config.DBHost) ||
		!readString(os.Getenv("DB_USER"), &config.DBUser) ||
		!readString(os.Getenv("DB_NAME"), &config.DBName) ||
		!readString(os.Getenv("JWT_SECRET"), &config.JWTSecret) ||
		!readString(os.Getenv("DB_PASSWORD"), &config.DBPassword) ||
		!readInt("TIMEZONE_DIFFERENCE_MINUTES", &TimeZoneMinutes) ||
		!readInt("DB_MAX_IDLE_CONNECTIONS", &config.MaxDbIdleConnections) ||
		!readInt("DB_MAX_OPEN_CONNECTIONS", &config.MaxDbOpenConnections) {
		return nil
	}

	return &config
}
