import { PageContainer } from './PageContainer';

interface PageLayoutProps {
  children: React.ReactNode;
  variant?: 'wide' | 'standard' | 'narrow' | 'full';
  padding?: 'sm' | 'md' | 'lg';
  header?: React.ReactNode;
  className?: string;
}

export function PageLayout({
  children,
  variant = 'standard',
  padding = 'md',
  header,
  className = '',
}: PageLayoutProps) {
  const paddingClasses = {
    sm: 'p-4 md:p-6', // Responsive: 16px mobile, 24px desktop
    md: 'p-4 md:p-6 lg:p-8', // Responsive: 16px mobile, 24px tablet, 32px desktop
    lg: 'p-6 md:p-8 lg:p-10', // Responsive: 24px mobile, 32px tablet, 40px desktop
  };

  if (header) {
    // Full-height layout with header
    return (
      <div className='h-full flex flex-col'>
        {header}
        <div className={`flex-1 overflow-auto ${paddingClasses[padding]}`}>
          <PageContainer variant={variant} className={className}>
            {children}
          </PageContainer>
        </div>
      </div>
    );
  }

  // Simple layout without header
  return (
    <div className={`${paddingClasses[padding]} space-y-6`}>
      <PageContainer variant={variant} className={className}>
        {children}
      </PageContainer>
    </div>
  );
}
