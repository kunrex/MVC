package types

type Config struct {
	AppPort                 int
	SaltRounds              int
	JWTSecret               string
	DBHost                  string
	DBUser                  string
	DBName                  string
	DBPassword              string
	MaxDbIdleConnections    int
	MaxDbOpenConnections    int
	LocalhostCertificate    string
	LocalhostCertificateKey string
	IsContainerInstance     bool
}
