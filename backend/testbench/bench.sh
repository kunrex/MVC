#!/bin/bash

if [ $# -lt 1 ]; then
    echo "No JWT provided."
    exit 1
fi

jwt="$1"

echo "Running GET Request: /menu [Retrieve full Menu and tags]"
echo "Getting menu 10000 times with 50 concurrent requests (safer for local testing)" 

ab -n 10000 -c 50 \
  -H "Authorization: Bearer $jwt" \
  "http://localhost:3000/menu"

echo "GET Request Test Done"
echo
echo "Running POST Requests: /auth to create a user and /order to create a corresponding order"
echo "Creating 100 users and corresponding order"

for i in $(seq 1 100); do
    name="user$i"
    email="user$i@mail"
    password="password$i"

    r=$(curl -s -w "\n%{time_total}" -X POST "http://localhost:3000/auth" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "name=$name&email=$email&password=$password&action=signup")

    body=$(echo "$r" | sed '$d')
    latency=$(echo "$r" | tail -n1)

    echo "User: $name"
    echo "Signup response: $body | Latency: ${latency}s"

    token=$(echo "$body" | jq -r '.awt')

    order_response=$(curl -s -w "\n%{time_total}" -X GET "http://localhost:3000/order" \
        -H "Authorization: Bearer $token")

    body=$(echo "$order_response" | sed '$d')
    order_latency=$(echo "$order_response" | tail -n1)

    echo "Order creation response: $body | Latency: ${order_latency}s"
    echo "----------------------------------------------------------"
done

echo "POST Request Test Done"