package utils

import (
	"errors"
	"github.com/golang-jwt/jwt/v5"
	"os"
	"time"
)

type jwtClaims struct {
	Id            int64
	Authorisation int
	jwt.RegisteredClaims
}

var secret = ""

const AccessRefreshTime = time.Second * 1800
const RefreshRefreshTime = time.Hour * 24 * 7

func InitJWT() bool {
	secret = os.Getenv("JWT_SECRET")
	return true
}

func GenerateAccessToken(id int64, authorisation int) (string, error) {
	claims := jwtClaims{
		Id:            id,
		Authorisation: authorisation,

		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(AccessRefreshTime)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signed, err := token.SignedString(secret)
	if err != nil {
		return "", err
	}

	return signed, nil
}

func GenerateRefreshToken(id int64, authorisation int) (string, error) {
	claims := jwtClaims{
		Id:            id,
		Authorisation: authorisation,

		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(RefreshRefreshTime)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signed, err := token.SignedString(secret)
	if err != nil {
		return "", err
	}

	return signed, nil
}

func VerifyToken(encodedToken string) (int64, int, error) {
	token, err := jwt.Parse(encodedToken, func(token *jwt.Token) (interface{}, error) {
		return secret, nil
	})

	if err != nil || !token.Valid {
		return 0, -1, err
	}

	claims, ok := token.Claims.(*jwtClaims)
	if !ok {
		return 0, -1, errors.New("expired token")
	}

	return claims.Id, claims.Authorisation, nil
}
