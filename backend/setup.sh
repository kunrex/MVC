#!/bin/bash

read -p "Enter salt rounds (default 10): " saltRounds
saltRounds=${saltRounds:-10}

read -p "Enter JWT secret (default 'jwt'): " jwtSecret
jwtSecret=${jwtSecret:-jwt}

read -p "Enter database name (default 'MVC'): " dbName
dbName=${dbName:-MVC}

read -p "Should the backend use cookies? (true/false, default false): " useCookies
useCookies=${useCookies:-false}

read -p "Is this a container instance? (true/false, default false): " containerInstance
containerInstance=${containerInstance:-false}

FILE=".env"

cat > "$FILE" <<EOF
APP_PORT=3000

SALT_ROUNDS=$saltRounds
JTW_SECRET=$jwtSecret

DB_NAME=$dbName
DB_HOST=localhost

DB_USER=root
DB_PASSWORD=root

DB_MAX_IDLE_CONNECTIONS=5
DB_MAX_OPEN_CONNECTIONS=25
DB_MAX_CONNECTION_LIFETIME=5

USE_COOKIES=useCookies

CONTAINER_INSTANCE=$containerInstance
EOF

echo "$FILE created successfully!"
echo "Values for these properties have been set implicitly:"
echo -e "\t 1. App Port: 3000 (If changed, change in docker-compose and MVC/frontend/src/app/utils/constants.ts)"
echo -e "\t 2. DBHost: localhost"
echo -e "\t 3. DBUser: root"
echo -e "\t 4. DBPassword: root (If changed, change in docker-compose)"
echo -e "\t 2. Max DB Idle Connections: 5"
echo -e "\t 3. Max DB OPen Connections: 25"
echo -e "\t 2. Max DB Connections Lifetime (minutes): 5"

echo
if [ "$containerInstance" = false ]; then
  echo "Running checks for non containerized application"
  if command -v go >/dev/null 2>&1; then
      echo "Go is installed: $(go version)"
  else
      echo "Go is not installed."
  fi

  if command -v mysql >/dev/null 2>&1; then
      echo "MySQL is installed: $(mysql --version)"
  else
      echo "MySQL is not installed."
  fi
fi
