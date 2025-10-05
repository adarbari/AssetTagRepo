# Asset Tag Frontend

Modern React application for asset tracking with real-time location monitoring and intelligent alerting.

## Features

- **Asset Management**: Complete CRUD operations with real-time updates
- **Location Tracking**: Interactive maps with real-time location monitoring
- **Geofencing**: Visual geofence creation and management
- **Job Management**: Asset assignment and utilization tracking
- **Maintenance**: Scheduling and tracking maintenance activities
- **Analytics**: Comprehensive reporting and dashboards
- **Alert System**: Real-time notifications and alert management

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for routing
- **Zustand** for state management
- **Leaflet** for maps
- **Chart.js** for data visualization

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   http://localhost:5173

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Environment Configuration

Create a `.env` file with:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_VERSION=v1
VITE_USE_MOCK_DATA=false

# WebSocket Configuration
VITE_WS_URL=ws://localhost:8000

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_GEOFENCING=true
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Base UI components
│   ├── common/         # Common business components
│   ├── assets/         # Asset management
│   ├── sites/          # Site management
│   ├── geofences/      # Geofence management
│   ├── jobs/           # Job management
│   ├── maintenance/    # Maintenance tracking
│   ├── alerts/         # Alert management
│   ├── reports/        # Reporting
│   └── dashboard/      # Dashboard
├── hooks/              # Custom React hooks
├── services/           # API services
├── types/              # TypeScript types
├── utils/              # Utility functions
├── data/               # Mock data
└── styles/             # Global styles
```

## Backend Integration

The frontend integrates with the Asset Tag Backend API:

- **REST APIs**: All CRUD operations
- **WebSocket**: Real-time updates for locations and alerts
- **Authentication**: JWT-based authentication
- **Error Handling**: Comprehensive error handling and user feedback

## Development

### Code Organization
- **Components**: Feature-based organization
- **Hooks**: Reusable logic
- **Services**: API communication
- **Types**: Shared interfaces
- **Utils**: Pure functions

### Testing
- **Unit Tests**: Component and utility testing
- **Integration Tests**: User workflow testing
- **Visual Tests**: UI regression testing

## Deployment

### Build Process
```bash
npm run build
```

The built files will be in the `build/` directory.

### Production Configuration
Update environment variables for production:
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
VITE_USE_MOCK_DATA=false
```

## Contributing

1. Follow the existing code patterns
2. Add tests for new features
3. Update documentation
4. Use TypeScript best practices
5. Follow the component organization

## License

MIT License
