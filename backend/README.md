# MVC Backend

Backend for MVC assignment

Fill in appropriate values in `MVC/backend/config.json`. Set `containerInstance` to true if running on a docker container or any other container runtime.

Remember to change the port in `MVC/backend/Dockerfile` if changing `appPort` in `MVC/backend/config.json`

Makefile commands (run from `MVC/backend`)
1. `make migrate-up`: migrate up
2. `make migrate-down`: migrate down
3. `make run`: run the application
4. `make build`: build the application
