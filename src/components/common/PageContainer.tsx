import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  variant?: 'wide' | 'standard' | 'narrow' | 'full';
  className?: string;
}

export function PageContainer({ 
  children, 
  variant = 'standard',
  className = '' 
}: PageContainerProps) {
  const maxWidths = {
    wide: 'max-w-[1600px]',      // Tables/Lists
    standard: 'max-w-7xl',        // Detail views
    narrow: 'max-w-4xl',          // Forms
    full: 'max-w-none',           // Maps, full-bleed
  };
  
  return (
    <div className={`${maxWidths[variant]} mx-auto space-y-6 ${className}`}>
      {children}
    </div>
  );
}
