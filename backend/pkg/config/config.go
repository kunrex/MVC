package config

import (
	"MVC/pkg/types"
	"github.com/joho/godotenv"
	"log"
	"os"
	"strconv"
)

func tryReadInt(envVariable string, address *int) bool {
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
		log.Printf("rrror loading .env file: %v", err.Error())
		return nil
	}

	ok := tryReadInt("APP_PORT", &config.AppPort)
	if !ok {
		return nil
	}

	config.DBHost = os.Getenv("DB_HOST")
	config.DBUser = os.Getenv("DB_USER")
	config.DBName = os.Getenv("DB_NAME")
	config.DBPassword = os.Getenv("DB_PASSWORD")

	ok = tryReadInt("DB_MAX_IDLE_CONNECTIONS", &config.MaxDbIdleConnections)
	if !ok {
		return nil
	}

	ok = tryReadInt("DB_MAX_OPEN_CONNECTIONS", &config.MaxDbOpenConnections)
	if !ok {
		return nil
	}

	config.JWTSecret = os.Getenv("JWT_SECRET")

	ok = tryReadInt("SALT_ROUNDS", &config.SaltRounds)
	if !ok {
		return nil
	}

	return &config
}
