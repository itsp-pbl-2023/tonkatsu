SERVICE_GO := server
SERVICE_DB := db
SRC := cmd/server/main.go

.PHONY: up down docker-clean

run-server:
	@docker compose exec ${SERVICE_GO} go run ${SRC}

up:
	@docker compose up -d

down:
	@docker compose down

docker-clean:
	@docker-compose down --rmi all --volumes --remove-orphans
