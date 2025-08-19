package types

type Config struct {
	AppPort int

	SaltRounds int
	JWTSecret  string

	DBName string
	DBHost string

	DBUser     string
	DBPassword string

	DBMaxIdleConnections    int
	DBMaxOpenConnections    int
	DBMaxConnectionLifetime int

	UseCookies        bool
	ContainerInstance bool
}
