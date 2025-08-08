package tests

import (
	"MVC/pkg/utils"
	"testing"
)

func LoadEnvTest(t *testing.T) {
	ok := utils.LoadEnv()
	if !ok {
		t.Fatal("failed to read env")
		return
	}
}

func JWTTest(t *testing.T) {
	LoadEnvTest(t)

	id := int64(1)
	authorisation := 7

	token, err := utils.GenerateAccessToken(id, authorisation)
	if err != nil {
		t.Error("failed to generate authorisation token")
		return
	}

	idConvert, authorisationConvert, err := utils.VerifyToken(token)
	if err != nil {
		t.Errorf("failed to verify token, error: %v", err.Error())
		return
	}

	if id != idConvert || authorisation != authorisationConvert {
		t.Error("verified tokens did not match original values")
		return
	}
}

func ByCryptTest(t *testing.T) {
	LoadEnvTest(t)

	password := "helloworld"
	hash, err := utils.Hash(password)
	if err != nil {
		t.Error("failed to hash password")
		return
	}

	if err := utils.CompareHash(password, hash); err != nil {
		t.Errorf("hash compare failed, error: %v", err.Error())
		return
	}
}
