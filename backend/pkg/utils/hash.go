package utils

import (
	"MVC/pkg/types"
	"crypto/sha256"
	"encoding/hex"
	"golang.org/x/crypto/bcrypt"
)

const MaxLength = 72

var saltRounds = 10

func InitHashing(config *types.Config) bool {
	saltRounds = config.SaltRounds
	return true
}

func HashPassword(password string) ([]byte, error) {
	result, err := bcrypt.GenerateFromPassword([]byte(password), saltRounds)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func ComparePasswordHash(password string, hash []byte) error {
	return bcrypt.CompareHashAndPassword(hash, []byte(password))
}

func HashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}
