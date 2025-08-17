package database

import (
	"MVC/pkg/types"
	"database/sql"
	"errors"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/mysql"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"time"
)

var DB *sql.DB = nil

func connectionString(dbUser string, dbPassword string, dbHost string, dbName string) string {
	return fmt.Sprintf("%s:%s@tcp(%s:3306)/%s", dbUser, dbPassword, dbHost, dbName)
}

func InitDatabase(configuration *types.Config) error {
	db, err := sql.Open("mysql", connectionString(configuration.DBUser, configuration.DBPassword, configuration.DBHost, ""))
	if err != nil {
		return err
	}

	_, err = db.Exec(fmt.Sprintf("CREATE DATABASE IF NOT EXISTS %v;", configuration.DBName))
	if err != nil {
		return err
	}

	db, err = sql.Open("mysql", connectionString(configuration.DBUser, configuration.DBPassword, configuration.DBHost, configuration.DBName))
	if err != nil {
		return err
	}

	driver, _ := mysql.WithInstance(db, &mysql.Config{})
	m, err := migrate.NewWithDatabaseInstance("file://database/migrations", "mysql", driver)
	if err != nil {
		return err
	}

	err = m.Up()
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return err
	}

	err = db.Ping()
	return err
}

func ConnectDatabase(config *types.Config) error {
	dbUser := config.DBUser
	dbHost := config.DBHost
	dbName := config.DBName
	dbPassword := config.DBPassword

	result, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s:3306)/%s", dbUser, dbPassword, dbHost, dbName))
	if err != nil {
		return err
	}

	DB = result

	DB.SetMaxOpenConns(config.DBMaxOpenConnections)
	DB.SetMaxIdleConns(config.DBMaxIdleConnections)
	DB.SetConnMaxLifetime(5 * time.Minute)

	return nil
}
