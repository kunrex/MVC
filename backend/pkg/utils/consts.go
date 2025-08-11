package utils

const accessCookie = "awt"

type ContextKey string

const UserId ContextKey = "id"
const UserAuthorisation ContextKey = "auth"

const MaxLength = 72

const AllowedHTTPHeaders = "Content-Type"
const AllowedHTTPOrigins = "http://localhost:4200"
const AllowedHTTPMethods = "GET, POST, PATCH, OPTIONS"
