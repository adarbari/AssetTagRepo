import React from &apos;react&apos;;
import { PageContainer } from &apos;./PageContainer&apos;;

interface PageLayoutProps {
  children: React.ReactNode;
  variant?: &apos;wide&apos; | &apos;standard&apos; | &apos;narrow&apos; | &apos;full&apos;;
  padding?: &apos;sm&apos; | &apos;md&apos; | &apos;lg&apos;;
  header?: React.ReactNode;
  className?: string;
}

export function PageLayout({
  children,
  variant = &apos;standard&apos;,
  padding = &apos;md&apos;,
  header,
  className = &apos;&apos;,
}: PageLayoutProps) {
  const paddingClasses = {
    sm: &apos;p-4 md:p-6&apos;, // Responsive: 16px mobile, 24px desktop
    md: &apos;p-4 md:p-6 lg:p-8&apos;, // Responsive: 16px mobile, 24px tablet, 32px desktop
    lg: &apos;p-6 md:p-8 lg:p-10&apos;, // Responsive: 24px mobile, 32px tablet, 40px desktop
  };

  if (header) {
    // Full-height layout with header
    return (
      <div className=&apos;h-full flex flex-col&apos;>
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
