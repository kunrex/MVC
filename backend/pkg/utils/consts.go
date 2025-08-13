package utils

const accessCookie = "awt"
const loginCookie = "loggedIn"

type ContextKey string

const UserId ContextKey = "id"
const UserAuthorisation ContextKey = "auth"

const MaxLength = 72

const AllowedHTTPHeaders = "Content-Type"
const AllowedHTTPOrigins = "https://localhost:4200"
const AllowedHTTPMethods = "GET, POST, OPTIONS, PATCH"
