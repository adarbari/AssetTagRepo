# AssetTag Repository Documentation

Welcome to the AssetTag repository! This documentation will help you understand the project structure, key concepts, and how to navigate the codebase.

## 🚀 Quick Start

1. **Install dependencies**: `npm install`
2. **Start development server**: `npm run dev`
3. **Run tests**: `npm test`
4. **Build for production**: `npm run build`

## 📁 Project Structure

### Code Organization (`/src`)

```
src/
├── components/           # React components organized by feature
│   ├── alerts/          # Alert management components
│   ├── assets/          # Asset management components
│   ├── dashboard/        # Dashboard components
│   ├── jobs/            # Job management components
│   ├── issues/          # Issue tracking components
│   ├── maintenance/      # Maintenance components
│   ├── map/             # Map and location components
│   ├── notifications/   # Notification components
│   ├── reports/         # Reporting components
│   ├── settings/        # Settings components
│   ├── sites/           # Site management components
│   ├── vehicles/        # Vehicle management components
│   ├── common/          # Reusable components
│   └── ui/              # UI component library (shadcn/ui)
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
├── services/            # API services
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── data/                # Mock data and configurations
└── test/                # Test utilities and setup
```

### Documentation Organization (`/docs`)

```
docs/
├── README.md                    # This file - developer onboarding
├── architecture/                # System architecture docs
├── features/                   # Feature-specific documentation
│   ├── alerts/                 # Alert system documentation
│   ├── jobs/                   # Job management documentation
│   ├── notifications/          # Notification system documentation
│   └── assets/                 # Asset management documentation
├── guides/                     # Developer guides
├── implementation/             # Implementation summaries
└── status/                     # Project status and changes
```

## 🏗️ Key Concepts

### Component Architecture

- **Feature-based organization**: Components are grouped by business feature (alerts, assets, jobs, etc.)
- **Reusable components**: Common components in `/components/common/`
- **UI components**: shadcn/ui components in `/components/ui/`
- **Index files**: Each feature folder has an `index.ts` for clean imports

### Data Flow

- **Contexts**: Global state management via React contexts
- **Hooks**: Custom hooks for data fetching and state management
- **Services**: API layer for backend communication
- **Types**: TypeScript definitions for type safety

### Testing Strategy

- **Unit tests**: Component-level testing
- **Integration tests**: Feature-level testing
- **Test utilities**: Shared testing helpers in `/test/`

## 🔍 Finding What You Need

### By Feature

- **Alerts**: `/src/components/alerts/` + `/docs/features/alerts/`
- **Assets**: `/src/components/assets/` + `/docs/features/assets/`
- **Jobs**: `/src/components/jobs/` + `/docs/features/jobs/`
- **Issues**: `/src/components/issues/` + `/docs/features/issues/`
- **Maintenance**: `/src/components/maintenance/` + `/docs/features/maintenance/`
- **Map**: `/src/components/map/` + `/docs/features/map/`
- **Notifications**: `/src/components/notifications/` + `/docs/features/notifications/`
- **Reports**: `/src/components/reports/` + `/docs/features/reports/`
- **Settings**: `/src/components/settings/` + `/docs/features/settings/`
- **Sites**: `/src/components/sites/` + `/docs/features/sites/`
- **Vehicles**: `/src/components/vehicles/` + `/docs/features/vehicles/`

### By Type

- **Components**: `/src/components/[feature]/`
- **Hooks**: `/src/hooks/`
- **Services**: `/src/services/`
- **Types**: `/src/types/`
- **Utils**: `/src/utils/`
- **Tests**: `/src/components/__tests__/` or `/src/[feature]/__tests__/`

## 📚 Documentation Index

- **[Architecture](architecture/)** - System design and patterns
- **[Features](features/)** - Feature-specific guides
- **[Guides](guides/)** - Developer guides and tutorials
- **[Implementation](implementation/)** - Implementation summaries
- **[Status](status/)** - Project status and recent changes

## 🛠️ Development Workflow

1. **Feature Development**: Create components in appropriate feature folder
2. **Testing**: Add tests in `__tests__/` directories
3. **Documentation**: Update relevant docs in `/docs/`
4. **Type Safety**: Use TypeScript types from `/types/`
5. **Code Quality**: Follow existing patterns and conventions

## 🔧 Common Tasks

### Adding a New Component

1. Create component in appropriate feature folder
2. Add to feature's `index.ts` file
3. Import in `App.tsx` if needed
4. Add tests in `__tests__/`
5. Update documentation if needed

### Adding a New Feature

1. Create new feature folder in `/components/`
2. Add `index.ts` with exports
3. Create feature documentation in `/docs/features/`
4. Add routing in `App.tsx`
5. Add tests and documentation

### Debugging

- Check browser console for errors
- Use React DevTools for component debugging
- Check test output for failing tests
- Review documentation for patterns and examples

## 📞 Getting Help

- **Code Issues**: Check existing components for patterns
- **Architecture Questions**: Review `/docs/architecture/`
- **Feature Questions**: Check `/docs/features/[feature]/`
- **Development Questions**: See `/docs/guides/`

## 🔄 Recent Changes

See [Recent Changes](status/RECENT_CHANGES.md) for the latest updates and improvements.

---

**Happy coding!** 🎉
