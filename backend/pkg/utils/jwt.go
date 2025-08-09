package utils

import (
	"MVC/pkg/types"
	"github.com/golang-jwt/jwt/v5"
	"time"
)

type jwtClaims struct {
	Id            int64
	Authorisation int
	jwt.RegisteredClaims
}

var secret []byte = nil

const AccessRefreshTime = time.Hour * 24 * 7

func InitJWT(config *types.Config) {
	secret = []byte(config.JWTSecret)
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

func VerifyToken(encodedToken string) (int64, int, error) {
	var claims jwtClaims
	token, err := jwt.ParseWithClaims(encodedToken, &claims, func(token *jwt.Token) (interface{}, error) {
		return secret, nil
	})

	if err != nil || !token.Valid {
		return 0, -1, err
	}

	return claims.Id, claims.Authorisation, nil
}
