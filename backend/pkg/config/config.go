package config

import (
	"MVC/pkg/types"
	"github.com/joho/godotenv"
	"log"
	"os"
	"strconv"
)

var TimeZoneMinutes int

func ReadString(envVariable string, address *string) bool {
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
		log.Println("falling back to .evn variables")
	}

	if !readInt("APP_PORT", &config.AppPort) ||
		!readInt("SALT_ROUNDS", &config.SaltRounds) ||
		!ReadString("DB_HOST", &config.DBHost) ||
		!ReadString("DB_USER", &config.DBUser) ||
		!ReadString("DB_NAME", &config.DBName) ||
		!ReadString("JWT_SECRET", &config.JWTSecret) ||
		!ReadString("DB_PASSWORD", &config.DBPassword) ||
		!readInt("TIMEZONE_DIFFERENCE_MINUTES", &TimeZoneMinutes) ||
		!readInt("DB_MAX_IDLE_CONNECTIONS", &config.MaxDbIdleConnections) ||
		!readInt("DB_MAX_OPEN_CONNECTIONS", &config.MaxDbOpenConnections) ||
		!ReadString("LOCAL_PEM", &config.LocalhostCertificate) ||
		!ReadString("LOCAL_PEM_KEY", &config.LocalhostCertificateKey) {
		return nil
	}

	config.IsContainerInstance = os.Getenv("DOCKER") == "true"
	return &config
}
