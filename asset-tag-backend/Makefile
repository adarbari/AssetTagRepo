# Asset Tag Backend Makefile

.PHONY: help install dev test lint format clean infrastructure-up infrastructure-down db-migrate db-reset

help: ## Show this help message
	@echo "Asset Tag Backend - Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install Python dependencies
	pip install -r requirements.txt
	pip install -r requirements-dev.txt

dev: ## Start development server
	python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

test: ## Run tests
	pytest tests/ -v

test-coverage: ## Run tests with coverage
	pytest tests/ --cov=. --cov-report=html --cov-report=term

lint: ## Run linting
	flake8 .
	black --check .
	isort --check-only .

format: ## Format code
	black .
	isort .

clean: ## Clean up temporary files
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf .pytest_cache
	rm -rf htmlcov
	rm -rf .coverage

infrastructure-up: ## Start infrastructure services
	docker-compose up -d

infrastructure-down: ## Stop infrastructure services
	docker-compose down

infrastructure-logs: ## View infrastructure logs
	docker-compose logs -f

db-migrate: ## Run database migrations
	alembic upgrade head

db-reset: ## Reset database (destructive)
	docker-compose down -v
	docker-compose up -d
	sleep 10
	alembic upgrade head

db-revision: ## Create new migration
	alembic revision --autogenerate -m "$(MSG)"

setup: install infrastructure-up db-migrate ## Complete setup for development

start-consumer: ## Start observation consumer
	python start.py

build: ## Build Docker image
	docker build -t asset-tag-backend .

run: ## Run Docker container
	docker run -p 8000:8000 --env-file .env asset-tag-backend
