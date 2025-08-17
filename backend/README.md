# MVC Backend

### Setup

Run `setup.sh` and fill in the appropriate values.
Alternative: Create file: `MVC/backend/.config.json` and fill in appropriate values:

```json
{
  "appPort": 3000,

  "saltRounds": 10,
  "jwtSecret": "jwt",

  "dbName": "MVC",
  "dbHost": "localhost",

  "dbUser": "root",
  "dbPassword": "root",

  "dbMaxIdleConnections": 5,
  "dbMaxOpenConnections": 25,
  "dbMaxConnectionLifetime": 5,

  "containerInstance": false
}
```

> Note: Frontend assumes server is running at localhost:3000 `(MVC/frontend/src/app/utils/constants.ts)`
> 
> Note: docker-compose assumes that mysql root password is `root` and `appPort` is 3000


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
