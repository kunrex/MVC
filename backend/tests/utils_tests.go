package tests

import (
	"MVC/pkg/types"
	"MVC/pkg/utils"
	"testing"
)

func JWTTest(t *testing.T) {
	configuration := types.InitConfig()
	if configuration == nil {
		t.Error("failed to load config")
		return
	}

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
	configuration := types.InitConfig()
	if configuration == nil {
		t.Error("failed to load config")
		return
	}

	password := "helloworld"
	hash, err := utils.HashPassword(password)
	if err != nil {
		t.Error("failed to hash password")
		return
	}

	if err := utils.ComparePasswordHash(password, hash); err != nil {
		t.Errorf("hash compare failed, error: %v", err.Error())
		return
	}
}
