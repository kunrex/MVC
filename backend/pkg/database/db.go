package database

import (
	"MVC/pkg/types"
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"time"
)

var DB *sql.DB = nil

func InitDB(config *types.Config) bool {
	dbUser := config.DBUser
	dbHost := config.DBHost
	dbName := config.DBName
	dbPassword := config.DBPassword

	result, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s:3306)/%s", dbUser, dbPassword, dbHost, dbName))
	if err != nil {
		return false
	}

	DB = result

	DB.SetMaxOpenConns(config.MaxDbOpenConnections)
	DB.SetMaxIdleConns(config.MaxDbIdleConnections)
	DB.SetConnMaxLifetime(5 * time.Minute)

	return true
}
