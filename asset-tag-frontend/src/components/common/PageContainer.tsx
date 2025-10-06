
interface PageContainerProps {
  children: React.ReactNode;
  variant?: 'wide' | 'standard' | 'narrow' | 'full';
  className?: string;
}

export function PageContainer({
  children,
  variant = 'standard',
  className = '',
}: PageContainerProps) {
  const maxWidths = {
    wide: 'max-w-[1400px]', // Data tables, management pages (modern standard)
    standard: 'max-w-[1200px]', // Detail views, dashboards (optimal readability)
    narrow: 'max-w-[800px]', // Forms, create/edit pages (focused content)
    full: 'max-w-none', // Maps, full-bleed interfaces
  };

  return (
    <div className={`${maxWidths[variant]} mx-auto space-y-6 ${className}`}>
      {children}
    </div>
  );
}
