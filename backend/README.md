# MVC Backend

### Setup

Run `setup.sh` and fill in the appropriate values. 

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
