# Asset Tag Repository Makefile

.PHONY: help install install-dev test test-cov lint format clean verify-lint auto-fix-lint setup-pre-commit

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	cd asset-tag-backend && make install
	cd asset-tag-frontend && npm ci

install-dev: ## Install all development dependencies
	@echo "📦 Installing development dependencies..."
	cd asset-tag-backend && make install-dev
	cd asset-tag-frontend && npm ci

test: ## Run all tests
	@echo "🧪 Running all tests..."
	cd asset-tag-backend && make test
	cd asset-tag-frontend && npm test

test-cov: ## Run tests with coverage
	@echo "🧪 Running tests with coverage..."
	cd asset-tag-backend && make test-cov
	cd asset-tag-frontend && npm run test:coverage

lint: ## Run linting on all components
	@echo "🔍 Running linting..."
	cd asset-tag-backend && make lint
	cd asset-tag-frontend && npm run lint

format: ## Format all code
	@echo "🎨 Formatting code..."
	cd asset-tag-backend && make format
	cd asset-tag-frontend && npm run format

verify-lint: ## Verify all lint checks pass (same as CI)
	@echo "🔍 Verifying all lint checks..."
	./scripts/verify-lint-checks.sh

auto-fix-lint: ## Auto-fix lint and formatting issues
	@echo "🔧 Auto-fixing lint and formatting issues..."
	./scripts/auto-fix-imports.sh

setup-pre-commit: ## Set up pre-commit hooks
	@echo "🪝 Setting up pre-commit hooks..."
	pip install pre-commit
	pre-commit install
	@echo "✅ Pre-commit hooks installed successfully!"

clean: ## Clean up temporary files
	@echo "🧹 Cleaning up temporary files..."
	cd asset-tag-backend && make clean
	cd asset-tag-frontend && rm -rf node_modules build dist coverage
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf .pytest_cache/
	rm -rf .coverage
	rm -rf htmlcov/

ci: verify-lint test-cov ## Run CI pipeline (verify lint + test with coverage)

# Quick development commands
dev-setup: install-dev setup-pre-commit ## Set up complete development environment
	@echo "🚀 Development environment setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Run 'make verify-lint' to check code quality"
	@echo "  2. Run 'make test' to run tests"
	@echo "  3. Run 'make auto-fix-lint' if you have lint issues"
	@echo ""
	@echo "Happy coding! 🎉"
