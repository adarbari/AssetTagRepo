// import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AssetContextCard } from '../common/AssetContextCard';
import type { Asset } from '../../types';

describe('AssetContextCard Component', () => {
  const mockAsset: Asset = {
    id: 'asset-123',
    name: 'Test Asset',
    type: 'Equipment',
    status: 'active',
    location: 'Building A, Floor 2',
    lastMaintenance: '2023-10-15',
    lastSeen: '2023-10-20T10:00:00Z',
    battery: 85,
  };

  const minimalAsset: Asset = {
    id: 'asset-456',
    name: 'Minimal Asset',
    type: 'Vehicle',
    status: 'inactive',
    location: 'Garage',
    lastSeen: '2023-10-19T15:30:00Z',
    battery: 45,
  };

  describe('Rendering', () => {
    it('should render nothing if assetId or assetName are missing', () => {
      const { container } = render(
        <AssetContextCard assetId='' assetName='' />
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('should render default variant with basic info', () => {
      render(
        <AssetContextCard assetId={mockAsset.id} assetName={mockAsset.name} />
      );

      expect(screen.getByText('Asset Information')).toBeInTheDocument();
      expect(screen.getByText('Test Asset')).toBeInTheDocument();
      expect(screen.getByText('asset-123')).toBeInTheDocument();
    });

    it('should render compact variant with basic info', () => {
      render(
        <AssetContextCard
          assetId={mockAsset.id}
          assetName={mockAsset.name}
          variant='compact'
        />
      );

      expect(screen.getByText('Test Asset')).toBeInTheDocument();
      expect(screen.getByText('asset-123')).toBeInTheDocument();
      expect(screen.queryByText('Asset Information')).not.toBeInTheDocument();
    });

    it('should render with custom title and description', () => {
      render(
        <AssetContextCard
          assetId={mockAsset.id}
          assetName={mockAsset.name}
          title='Selected Asset'
          description='This asset has been pre-selected for the operation'
        />
      );

      expect(screen.getByText('Selected Asset')).toBeInTheDocument();
      expect(
        screen.getByText('This asset has been pre-selected for the operation')
      ).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should display all available asset context fields', () => {
      render(
        <AssetContextCard
          assetId={mockAsset.id}
          assetName={mockAsset.name}
          assetContext={mockAsset}
        />
      );

      // Check all displayed fields
      expect(screen.getByText('Type:')).toBeInTheDocument();
      expect(screen.getByText('Equipment')).toBeInTheDocument();
      expect(screen.getByText('Status:')).toBeInTheDocument();
      expect(screen.getAllByText('active')).toHaveLength(2); // One in text, one in badge
      expect(screen.getByText('Location:')).toBeInTheDocument();
      expect(screen.getByText('Building A, Floor 2')).toBeInTheDocument();
    });

    it('should display last maintenance in compact variant', () => {
      render(
        <AssetContextCard
          assetId={mockAsset.id}
          assetName={mockAsset.name}
          assetContext={mockAsset}
          variant='compact'
          description='Selected asset:'
        />
      );

      expect(screen.getByText('Last Maintenance:')).toBeInTheDocument();
      expect(screen.getByText('2023-10-15')).toBeInTheDocument();
    });

    it('should not display last maintenance if not provided in compact variant', () => {
      render(
        <AssetContextCard
          assetId={minimalAsset.id}
          assetName={minimalAsset.name}
          assetContext={minimalAsset}
          variant='compact'
        />
      );

      expect(screen.queryByText(/Last Maintenance/)).not.toBeInTheDocument();
    });

    it('should display StatusBadge for default variant if status is present', () => {
      render(
        <AssetContextCard
          assetId={mockAsset.id}
          assetName={mockAsset.name}
          assetContext={mockAsset}
        />
      );
      expect(screen.getAllByText('active')).toHaveLength(2); // One in text, one in badge
      // Check that the badge has the correct styling
      const badges = screen.getAllByText('active');
      const badge = badges.find(el => el.closest('[data-slot=&quot;badge&quot;]'));
      expect(badge).toHaveClass('bg-green-100');
    });

    it('should not display StatusBadge for compact variant', () => {
      render(
        <AssetContextCard
          assetId={mockAsset.id}
          assetName={mockAsset.name}
          assetContext={mockAsset}
          variant='compact'
        />
      );
      // In compact variant, status should not be displayed at all
      expect(screen.queryByText('active')).not.toBeInTheDocument();
      expect(screen.queryByText('Status:')).not.toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should apply correct CSS classes for default variant', () => {
      const { container } = render(
        <AssetContextCard
          assetId={mockAsset.id}
          assetName={mockAsset.name}
          assetContext={mockAsset}
        />
      );
      const cardContent = container.querySelector('.p-4.bg-muted.rounded-lg');
      expect(cardContent).toBeInTheDocument();
    });

    it('should apply correct CSS classes for compact variant', () => {
      const { container } = render(
        <AssetContextCard
          assetId={mockAsset.id}
          assetName={mockAsset.name}
          assetContext={mockAsset}
          variant='compact'
        />
      );
      const cardContent = container.querySelector('.pt-6');
      expect(cardContent).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle asset context with minimal data', () => {
      render(
        <AssetContextCard
          assetId={minimalAsset.id}
          assetName={minimalAsset.name}
          assetContext={minimalAsset}
        />
      );

      expect(screen.getByText('Minimal Asset')).toBeInTheDocument();
      expect(screen.getByText('asset-456')).toBeInTheDocument();
      expect(screen.getByText('Type:')).toBeInTheDocument();
      expect(screen.getByText('Vehicle')).toBeInTheDocument();
      expect(screen.getByText('Status:')).toBeInTheDocument();
      expect(screen.getAllByText('inactive')).toHaveLength(2); // One in text, one in badge
      expect(screen.getByText('Location:')).toBeInTheDocument();
      expect(screen.getByText('Garage')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure in default variant', () => {
      render(
        <AssetContextCard assetId={mockAsset.id} assetName={mockAsset.name} />
      );
      expect(
        screen.getByRole('heading', { name: 'Asset Information' })
      ).toBeInTheDocument();
    });

    it('should have proper text content for screen readers', () => {
      render(
        <AssetContextCard
          assetId={mockAsset.id}
          assetName={mockAsset.name}
          assetContext={mockAsset}
        />
      );
      expect(screen.getByText('Type:')).toBeInTheDocument();
      expect(screen.getByText('Equipment')).toBeInTheDocument();
    });
  });
});
