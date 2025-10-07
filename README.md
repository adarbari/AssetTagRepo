
# Asset Tag System

A comprehensive asset tracking system with Bluetooth-based location estimation, real-time monitoring, and intelligent alerting.

## Architecture

This is a **monorepo** containing both frontend and backend components:

```
AssetTagRepo/
├── asset-tag-frontend/     # React frontend application
├── asset-tag-backend/      # Python FastAPI backend
├── docs/                   # Shared documentation
└── package.json           # Monorepo workspace configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- **Docker Desktop** (Required for backend infrastructure)

#### Installing Docker Desktop

**For macOS:**
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Install the .dmg file
3. Start Docker Desktop application
4. Verify installation: `docker --version` and `docker-compose --version`

**Alternative installation via Homebrew:**
```bash
brew install --cask docker
```

**Important:** Docker Desktop must be running before starting the backend services.

### Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd AssetTagRepo
   ```

2. **Install dependencies**:
   ```bash
   npm run setup
   ```

3. **Start Docker Desktop** (if not already running):
   - Open Docker Desktop application
   - Wait for it to fully start

4. **Start infrastructure services**:
   ```bash
   npm run infrastructure:up
   # OR manually: cd asset-tag-backend && docker-compose up -d
   ```

5. **Run database migrations**:
   ```bash
   npm run db:migrate
   # OR manually: cd asset-tag-backend && alembic upgrade head
   ```

6. **Start development servers**:
   ```bash
   npm run dev
   ```

This will start:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📋 Features

- **Asset Management**: Track and manage assets with detailed information
- **Job Management**: Create, assign, and track jobs and maintenance tasks
- **Issue Tracking**: Report and manage issues with workflow support
- **Alert System**: Configurable alerts with hierarchical settings
- **Map Integration**: Visual asset tracking with geofencing
- **Reporting**: Generate reports and analytics
- **Notifications**: Real-time notification system
- **Site Management**: Multi-site asset organization

## 🏗️ Architecture

This project follows a feature-based architecture with clear separation of concerns:

- **Components**: Organized by feature (alerts, assets, jobs, etc.)
- **TypeScript**: Full type safety throughout the application
- **Modern React**: Hooks, contexts, and functional components
- **Testing**: Comprehensive test coverage with Vitest
- **UI Components**: shadcn/ui component library

## 📁 Project Structure

```
├── src/
│   ├── components/          # Feature-organized React components
│   ├── contexts/           # React contexts for state management
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── docs/                   # Comprehensive documentation
└── tests/                  # Test files and utilities
```

## 📚 Documentation

For detailed documentation, see [/docs/README.md](docs/README.md)

- **[Architecture](docs/architecture/)** - System design and patterns
- **[Features](docs/features/)** - Feature-specific guides
- **[Guides](docs/guides/)** - Developer guides and tutorials
- **[Implementation](docs/implementation/)** - Implementation summaries

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open [http://localhost:5173](http://localhost:5173)

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Key Technologies

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Vitest** - Fast unit testing framework
- **shadcn/ui** - Modern UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - State management

## 🔧 Troubleshooting

### Common Issues

**1. Backend won't start (UUID/SQLite errors):**
- Ensure Docker Desktop is running
- Start infrastructure services: `cd asset-tag-backend && docker-compose up -d`
- The backend requires PostgreSQL with TimescaleDB, not SQLite

**2. Docker services not starting:**
```bash
# Check Docker Desktop is running
docker --version

# Check service status
cd asset-tag-backend && docker-compose ps

# View service logs
docker-compose logs [service-name]
```

**3. Port conflicts:**
```bash
# Check what's using the ports
lsof -i :8000  # Backend API
lsof -i :5173  # Frontend
lsof -i :5432  # PostgreSQL
```

**4. Database connection errors:**
```bash
# Reset database (WARNING: This will delete all data)
cd asset-tag-backend
docker-compose down -v && docker-compose up -d
alembic upgrade head
```

### Service Health Checks

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/health
- **API Docs**: http://localhost:8000/docs
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **MLFlow**: http://localhost:5000

## 📖 Contributing

1. Follow the existing code patterns and architecture
2. Add tests for new features
3. Update documentation as needed
4. Follow TypeScript best practices
5. Use the established component organization

## 📞 Support

- **Documentation**: See `/docs/` for comprehensive guides
- **Issues**: Check existing issues and create new ones as needed
- **Architecture**: Review `/docs/architecture/` for system design

## 🔄 Recent Updates

See [Recent Changes](docs/status/RECENT_CHANGES.md) for the latest updates and improvements.

---

**Built with ❤️ using modern web technologies**
  