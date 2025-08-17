package config

import (
	"MVC/pkg/types"
	"encoding/json"
	"log"
	"os"
)

func InitConfig() *types.Config {
	contents, err := os.ReadFile("./config.json")
	if err != nil {
		log.Fatalf("error reading config.json: %v", err.Error())
	}

	var config types.Config
	err = json.Unmarshal(contents, &config)
	if err != nil {
		log.Fatalf("error reading config.json: %v", err.Error())
	}

	return &config
}
