# MVC Backend

Backend for MVC assignment

### localhost SSL certificates

Use `mkcert` to create local SSL certificates for `localhost` and store them in `certificates`

### Setting up the .env

Rename the `backend/.envexample` file to `backend/.env` and fill in the appropriate values.

Makefile commands (run from `MVC/backend`)
1. `make migrate-up`: migrate up
2. `make migrate-down`: migrate down
3. `make run`: run the application
