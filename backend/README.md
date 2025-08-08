# MVC Backend

Backend for MVC assignment

### Setting up the .env

Rename the `backend/.envexample` file to `backend/.env` and fill in the appropriate values.

An Example:
```env
APP_PORT=3000

JWT_SECRET=superhadstringwoahdamn

SALT_ROUNDS=10

DB_HOST=localhost
DB_USER=user
DB_PASSWORD=password
DB_NAME=database

DB_MAX_IDLE_CONNECTIONS=5
DB_MAX_OPEN_CONNECTIONS=25
```

Makefile commands (run from `MVC/backend`)
1. `make migrate-up`: migrate up
2. `make migrate-down`: migrate down
3. `make run`: run the application
   