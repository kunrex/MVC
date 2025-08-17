package utils

const HeaderPrefix = "Bearer "

type ContextKey string

const UserId ContextKey = "id"
const UserAuthorisation ContextKey = "auth"

const MaxLength = 72

const AllowedHTTPOrigins = "http://localhost:4200"
const AllowedHTTPMethods = "GET, POST, OPTIONS, PATCH"
const AllowedHTTPHeaders = "Content-Type, Authorization"
