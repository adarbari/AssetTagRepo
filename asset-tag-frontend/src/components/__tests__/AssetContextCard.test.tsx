// import React from &apos;react&apos;;
import { render, screen } from &apos;@testing-library/react&apos;;
import { describe, it, expect } from &apos;vitest&apos;;
import { AssetContextCard } from &apos;../common/AssetContextCard&apos;;
import type { Asset } from &apos;../../types&apos;;

describe(&apos;AssetContextCard Component&apos;, () => {
  const mockAsset: Asset = {
    id: &apos;asset-123&apos;,
    name: &apos;Test Asset&apos;,
    type: &apos;Equipment&apos;,
    status: &apos;active&apos;,
    location: &apos;Building A, Floor 2&apos;,
    lastMaintenance: &apos;2023-10-15&apos;,
    lastSeen: &apos;2023-10-20T10:00:00Z&apos;,
    battery: 85,
  };

  const minimalAsset: Asset = {
    id: &apos;asset-456&apos;,
    name: &apos;Minimal Asset&apos;,
    type: &apos;Vehicle&apos;,
    status: &apos;inactive&apos;,
    location: &apos;Garage&apos;,
    lastSeen: &apos;2023-10-19T15:30:00Z&apos;,
    battery: 45,
  };

  describe(&apos;Rendering&apos;, () => {
    it(&apos;should render nothing if assetId or assetName are missing&apos;, () => {
      const { container } = render(
        <AssetContextCard assetId=&apos;&apos; assetName=&apos;&apos; />
      );
      expect(container).toBeEmptyDOMElement();
    });

    it(&apos;should render default variant with basic info&apos;, () => {
      render(
        <AssetContextCard assetId={mockAsset.id} assetName={mockAsset.name} />
      );

      expect(screen.getByText(&apos;Asset Information&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Test Asset&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;asset-123&apos;)).toBeInTheDocument();
    });

    it(&apos;should render compact variant with basic info&apos;, () => {
      render(
        <AssetContextCard
          assetId={mockAsset.id}
          assetName={mockAsset.name}
          variant=&apos;compact&apos;
        />
      );

      expect(screen.getByText(&apos;Test Asset&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;asset-123&apos;)).toBeInTheDocument();
      expect(screen.queryByText(&apos;Asset Information&apos;)).not.toBeInTheDocument();
    });

    it(&apos;should render with custom title and description&apos;, () => {
      render(
        <AssetContextCard
          assetId={mockAsset.id}
          assetName={mockAsset.name}
          title=&apos;Selected Asset&apos;
          description=&apos;This asset has been pre-selected for the operation&apos;
        />
      );

      expect(screen.getByText(&apos;Selected Asset&apos;)).toBeInTheDocument();
      expect(
        screen.getByText(&apos;This asset has been pre-selected for the operation&apos;)
      ).toBeInTheDocument();
    });
  });

  describe(&apos;Data Display&apos;, () => {
    it(&apos;should display all available asset context fields&apos;, () => {
      render(
        <AssetContextCard
          assetId={mockAsset.id}
          assetName={mockAsset.name}
          assetContext={mockAsset}
        />
      );

      // Check all displayed fields
      expect(screen.getByText(&apos;Type:&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Equipment&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Status:&apos;)).toBeInTheDocument();
      expect(screen.getAllByText(&apos;active&apos;)).toHaveLength(2); // One in text, one in badge
      expect(screen.getByText(&apos;Location:&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Building A, Floor 2&apos;)).toBeInTheDocument();
    });

    it(&apos;should display last maintenance in compact variant&apos;, () => {
      render(
        <AssetContextCard
          assetId={mockAsset.id}
          assetName={mockAsset.name}
          assetContext={mockAsset}
          variant=&apos;compact&apos;
          description=&apos;Selected asset:&apos;
        />
      );

      expect(screen.getByText(&apos;Last Maintenance:&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;2023-10-15&apos;)).toBeInTheDocument();
    });

    it(&apos;should not display last maintenance if not provided in compact variant&apos;, () => {
      render(
        <AssetContextCard
          assetId={minimalAsset.id}
          assetName={minimalAsset.name}
          assetContext={minimalAsset}
          variant=&apos;compact&apos;
        />
      );

      expect(screen.queryByText(/Last Maintenance/)).not.toBeInTheDocument();
    });

    it(&apos;should display StatusBadge for default variant if status is present&apos;, () => {
      render(
        <AssetContextCard
          assetId={mockAsset.id}
          assetName={mockAsset.name}
          assetContext={mockAsset}
        />
      );
      expect(screen.getAllByText(&apos;active&apos;)).toHaveLength(2); // One in text, one in badge
      // Check that the badge has the correct styling
      const badges = screen.getAllByText(&apos;active&apos;);
      const badge = badges.find(el => el.closest(&apos;[data-slot=&quot;badge&quot;]&apos;));
      expect(badge).toHaveClass(&apos;bg-green-100&apos;);
    });

    it(&apos;should not display StatusBadge for compact variant&apos;, () => {
      render(
        <AssetContextCard
          assetId={mockAsset.id}
          assetName={mockAsset.name}
          assetContext={mockAsset}
          variant=&apos;compact&apos;
        />
      );
      // In compact variant, status should not be displayed at all
      expect(screen.queryByText(&apos;active&apos;)).not.toBeInTheDocument();
      expect(screen.queryByText(&apos;Status:&apos;)).not.toBeInTheDocument();
    });
  });

  describe(&apos;Styling and Layout&apos;, () => {
    it(&apos;should apply correct CSS classes for default variant&apos;, () => {
      const { container } = render(
        <AssetContextCard
          assetId={mockAsset.id}
          assetName={mockAsset.name}
          assetContext={mockAsset}
        />
      );
      const cardContent = container.querySelector(&apos;.p-4.bg-muted.rounded-lg&apos;);
      expect(cardContent).toBeInTheDocument();
    });

    it(&apos;should apply correct CSS classes for compact variant&apos;, () => {
      const { container } = render(
        <AssetContextCard
          assetId={mockAsset.id}
          assetName={mockAsset.name}
          assetContext={mockAsset}
          variant=&apos;compact&apos;
        />
      );
      const cardContent = container.querySelector(&apos;.pt-6&apos;);
      expect(cardContent).toBeInTheDocument();
    });
  });

  describe(&apos;Edge Cases&apos;, () => {
    it(&apos;should handle asset context with minimal data&apos;, () => {
      render(
        <AssetContextCard
          assetId={minimalAsset.id}
          assetName={minimalAsset.name}
          assetContext={minimalAsset}
        />
      );

      expect(screen.getByText(&apos;Minimal Asset&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;asset-456&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Type:&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Vehicle&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Status:&apos;)).toBeInTheDocument();
      expect(screen.getAllByText(&apos;inactive&apos;)).toHaveLength(2); // One in text, one in badge
      expect(screen.getByText(&apos;Location:&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Garage&apos;)).toBeInTheDocument();
    });
  });

  describe(&apos;Accessibility&apos;, () => {
    it(&apos;should have proper heading structure in default variant&apos;, () => {
      render(
        <AssetContextCard assetId={mockAsset.id} assetName={mockAsset.name} />
      );
      expect(
        screen.getByRole(&apos;heading&apos;, { name: &apos;Asset Information&apos; })
      ).toBeInTheDocument();
    });

    it(&apos;should have proper text content for screen readers&apos;, () => {
      render(
        <AssetContextCard
          assetId={mockAsset.id}
          assetName={mockAsset.name}
          assetContext={mockAsset}
        />
      );
      expect(screen.getByText(&apos;Type:&apos;)).toBeInTheDocument();
      expect(screen.getByText(&apos;Equipment&apos;)).toBeInTheDocument();
    });
  });
});
