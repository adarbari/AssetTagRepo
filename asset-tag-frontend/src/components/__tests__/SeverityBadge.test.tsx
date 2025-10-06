// import React from &apos;react&apos;;
import { render, screen } from &apos;@testing-library/react&apos;;
import { describe, it, expect } from &apos;vitest&apos;;
import { SeverityBadge } from &apos;../common/SeverityBadge&apos;;

describe(&apos;SeverityBadge Component&apos;, () => {
  describe(&apos;Rendering&apos;, () => {
    it(&apos;should render with correct text&apos;, () => {
      render(<SeverityBadge severity=&apos;critical&apos; />);
      expect(screen.getByText(&apos;critical&apos;)).toBeInTheDocument();
    });

    it(&apos;should render with custom className&apos;, () => {
      render(<SeverityBadge severity=&apos;high&apos; className=&apos;custom-class&apos; />);
      const badge = screen.getByText(&apos;high&apos;);
      expect(badge).toHaveClass(&apos;custom-class&apos;);
    });
  });

  describe(&apos;Severity Color Mapping&apos;, () => {
    it(&apos;should apply correct colors for critical severity&apos;, () => {
      render(<SeverityBadge severity=&apos;critical&apos; />);
      const badge = screen.getByText(&apos;critical&apos;);
      expect(badge).toHaveClass(&apos;bg-red-100&apos;, &apos;text-red-700&apos;, &apos;border-red-200&apos;);
    });

    it(&apos;should apply correct colors for high severity&apos;, () => {
      render(<SeverityBadge severity=&apos;high&apos; />);
      const badge = screen.getByText(&apos;high&apos;);
      expect(badge).toHaveClass(
        &apos;bg-orange-100&apos;,
        &apos;text-orange-700&apos;,
        &apos;border-orange-200&apos;
      );
    });

    it(&apos;should apply correct colors for medium severity&apos;, () => {
      render(<SeverityBadge severity=&apos;medium&apos; />);
      const badge = screen.getByText(&apos;medium&apos;);
      expect(badge).toHaveClass(
        &apos;bg-yellow-100&apos;,
        &apos;text-yellow-700&apos;,
        &apos;border-yellow-200&apos;
      );
    });

    it(&apos;should apply correct colors for low severity&apos;, () => {
      render(<SeverityBadge severity=&apos;low&apos; />);
      const badge = screen.getByText(&apos;low&apos;);
      expect(badge).toHaveClass(
        &apos;bg-blue-100&apos;,
        &apos;text-blue-700&apos;,
        &apos;border-blue-200&apos;
      );
    });
  });

  describe(&apos;Case Insensitive Handling&apos;, () => {
    it(&apos;should handle uppercase severity&apos;, () => {
      render(<SeverityBadge severity=&apos;CRITICAL&apos; />);
      const badge = screen.getByText(&apos;CRITICAL&apos;);
      expect(badge).toHaveClass(&apos;bg-red-100&apos;, &apos;text-red-700&apos;, &apos;border-red-200&apos;);
    });

    it(&apos;should handle mixed case severity&apos;, () => {
      render(<SeverityBadge severity=&apos;High&apos; />);
      const badge = screen.getByText(&apos;High&apos;);
      expect(badge).toHaveClass(
        &apos;bg-orange-100&apos;,
        &apos;text-orange-700&apos;,
        &apos;border-orange-200&apos;
      );
    });
  });

  describe(&apos;Unknown Severity Handling&apos;, () => {
    it(&apos;should default to medium colors for unknown severity&apos;, () => {
      render(<SeverityBadge severity=&apos;unknown&apos; as IssueSeverity />);
      const badge = screen.getByText(&apos;unknown&apos;);
      expect(badge).toHaveClass(
        &apos;bg-yellow-100&apos;,
        &apos;text-yellow-700&apos;,
        &apos;border-yellow-200&apos;
      );
    });
  });

  describe(&apos;Accessibility&apos;, () => {
    it(&apos;should be accessible with proper role&apos;, () => {
      render(<SeverityBadge severity=&apos;critical&apos; />);
      const badge = screen.getByText(&apos;critical&apos;);
      expect(badge).toBeInTheDocument();
    });

    it(&apos;should have proper text content&apos;, () => {
      render(<SeverityBadge severity=&apos;high&apos; />);
      expect(screen.getByText(&apos;high&apos;)).toBeInTheDocument();
    });
  });
});
