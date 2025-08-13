package utils

const accessCookie = "awt"
const loginCookie = "loggedIn"

type ContextKey string

const UserId ContextKey = "id"
const UserAuthorisation ContextKey = "auth"

const MaxLength = 72

const AllowedHTTPHeaders = "Content-Type"
const AllowedHTTPMethods = "GET, POST, OPTIONS"
const AllowedHTTPOrigins = "https://localhost:4200"
