# MVC Backend

### Setup

Run `setup.sh` and fill in the appropriate values.
Alternative: Create file: `MVC/backend/.env` and fill in appropriate values:

```env
APP_PORT=3000

SALT_ROUNDS=10
JTW_SECRET=jwt

DB_NAME=db
DB_HOST=localhost

DB_USER=root
DB_PASSWORD=root

DB_MAX_IDLE_CONNECTIONS=5
DB_MAX_OPEN_CONNECTIONS=25
DB_MAX_CONNECTION_LIFETIME=5

USE_COOKIES=false

CONTAINER_INSTANCE=false
```

> Note: Frontend assumes server is running at localhost:3000 `(MVC/frontend/src/app/utils/constants.ts)`
> 
> Note: `docker-compose.yaml` assumes that mysql root password is `root`, the server is exposed to port `3000`, and the DB_HOST is `db`


### Running (without Docker)

From `MVC/backend`

1. Initialise `migrations`
```shell
make migrate-up
```

2. Running 
```shell
make run
```

### Running (with Docker)

From `MVC/backend`

```shell
docker compose up
```
