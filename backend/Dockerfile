FROM golang:latest AS builder
LABEL author="kunrex"
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -a -o /main ./cmd/main.go

FROM scratch

WORKDIR /app

COPY --from=builder /app/assets ./assets
COPY --from=builder /app/database ./database
COPY --from=builder /app/config.json ./config.json

COPY --from=builder /main .

CMD ["/app/main"]