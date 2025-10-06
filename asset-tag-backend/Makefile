# Asset Tag Backend Makefile

.PHONY: help install install-dev test test-cov lint format clean run run-dev migrate migrate-up migrate-down docker-build docker-run

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install production dependencies
	pip install -r requirements.txt

install-dev: ## Install development dependencies
	pip install -r requirements.txt
	pip install -r requirements-dev.txt
	pip install -r requirements-test.txt

test: ## Run tests
	pytest tests/ -v

test-cov: ## Run tests with coverage
	pytest tests/ -v --cov=. --cov-report=html --cov-report=term

test-unit: ## Run unit tests only
	pytest tests/ -v -m "unit"

test-api: ## Run API tests only
	pytest tests/ -v -m "api"

test-integration: ## Run integration tests only
	pytest tests/ -v -m "integration"

lint: ## Run linting
	flake8 .
	mypy .

format: ## Format code
	black .
	isort .

clean: ## Clean up temporary files
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf .pytest_cache/
	rm -rf .coverage
	rm -rf htmlcov/
	rm -rf dist/
	rm -rf build/

run: ## Run the application
	python main.py

run-dev: ## Run the application in development mode
	uvicorn main:app --reload --host 0.0.0.0 --port 8000

migrate: ## Create a new migration
	alembic revision --autogenerate -m "$(MESSAGE)"

migrate-up: ## Run database migrations
	alembic upgrade head

migrate-down: ## Rollback database migrations
	alembic downgrade -1

docker-build: ## Build Docker image
	docker build -t asset-tag-backend .

docker-run: ## Run Docker container
	docker run -p 8000:8000 asset-tag-backend

docker-compose-up: ## Start services with docker-compose
	docker-compose up -d

docker-compose-down: ## Stop services with docker-compose
	docker-compose down

setup-dev: install-dev migrate-up ## Set up development environment

ci: lint test-cov ## Run CI pipeline (lint + test with coverage)