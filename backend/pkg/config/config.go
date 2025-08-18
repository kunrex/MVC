package config

import (
	"MVC/pkg/types"
	"github.com/joho/godotenv"
	"log"
	"os"
	"strconv"
)

func readInt(variable string, address *int) {
	temp := os.Getenv(variable)
	value, err := strconv.Atoi(temp)
	if err != nil {
		log.Fatalf("failed to convert %s to int: %v", variable, err)
	}

	*address = value
}

func readBool(variable string, address *bool) {
	temp := os.Getenv(variable)
	value, err := strconv.ParseBool(temp)
	if err != nil {
		log.Fatalf("failed to convert %s to bool: %v", variable, err)
	}

	*address = value
}

func readString(variable string, address *string) {
	temp := os.Getenv(variable)
	if temp == "" {
		log.Printf("%v is empty", variable)
	}

	*address = temp
}

func InitConfig() *types.Config {
	var config types.Config

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	readInt("APP_PORT", &config.AppPort)

	readInt("SALT_ROUNDS", &config.SaltRounds)
	readString("JWT_SECRET", &config.JWTSecret)

	readString("DB_NAME", &config.DBName)
	readString("DB_HOST", &config.DBHost)

	readString("DB_USER", &config.DBUser)
	readString("DB_PASSWORD", &config.DBPassword)

	readInt("DB_MAX_IDLE_CONNECTIONS", &config.DBMaxIdleConnections)
	readInt("DB_MAX_OPEN_CONNECTIONS", &config.DBMaxOpenConnections)
	readInt("DB_MAX_CONNECTION_LIFETIME", &config.DBMaxConnectionLifetime)

	readBool("CONTAINER_INSTANCE", &config.ContainerInstance)

	return &config
}
