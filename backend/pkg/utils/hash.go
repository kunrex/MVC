package utils

import (
	"errors"
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"os"
	"strconv"
)

const MaxLength = 72

var saltRounds = 10

func InitHashing() bool {
	envValue := os.Getenv("SALT_ROUNDS")

	value, err := strconv.Atoi(envValue)
	if err != nil {
		return false
	}

	saltRounds = value
	return true
}

func Hash(password string) ([]byte, error) {
	if len(password) > MaxLength {
		return nil, errors.New(fmt.Sprintf("maximum password length is %v", MaxLength))
	}

	result, err := bcrypt.GenerateFromPassword([]byte(password), saltRounds)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func CompareHash(password string, hash []byte) error {
	return bcrypt.CompareHashAndPassword(hash, []byte(password))
}
