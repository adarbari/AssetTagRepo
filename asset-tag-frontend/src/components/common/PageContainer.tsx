import React from &apos;react&apos;;

interface PageContainerProps {
  children: React.ReactNode;
  variant?: &apos;wide&apos; | &apos;standard&apos; | &apos;narrow&apos; | &apos;full&apos;;
  className?: string;
}

export function PageContainer({
  children,
  variant = &apos;standard&apos;,
  className = &apos;&apos;,
}: PageContainerProps) {
  const maxWidths = {
    wide: &apos;max-w-[1400px]&apos;, // Data tables, management pages (modern standard)
    standard: &apos;max-w-[1200px]&apos;, // Detail views, dashboards (optimal readability)
    narrow: &apos;max-w-[800px]&apos;, // Forms, create/edit pages (focused content)
    full: &apos;max-w-none&apos;, // Maps, full-bleed interfaces
  };

  return (
    <div className={`${maxWidths[variant]} mx-auto space-y-6 ${className}`}>
      {children}
    </div>
  );
}
