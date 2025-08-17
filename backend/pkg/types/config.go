package types

type Config struct {
	AppPort int `json:"appPort"`

	SaltRounds int    `json:"saltRounds"`
	JWTSecret  string `json:"jwtSecret"`

	DBName string `json:"dbName"`
	DBHost string `json:"dbHost"`

	DBUser     string `json:"dbUser"`
	DBPassword string `json:"dbPassword"`

	DBMaxIdleConnections    int `json:"dbMaxIdleConnections"`
	DBMaxOpenConnections    int `json:"dbMaxOpenConnections"`
	DBMaxConnectionLifetime int `json:"dbMaxConnectionLifetime"`

	ContainerInstance bool `json:"containerInstance"`
}
