&apos;use client&apos;;

import React from &apos;react&apos;;
import { useTheme } from &apos;next-themes&apos;;
import { Toaster as Sonner, ToasterProps } from &apos;sonner&apos;;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = &apos;system&apos; } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps[&apos;theme&apos;]}
      className=&apos;toaster group&apos;
      style={
        {
          &apos;--normal-bg&apos;: &apos;var(--popover)&apos;,
          &apos;--normal-text&apos;: &apos;var(--popover-foreground)&apos;,
          &apos;--normal-border&apos;: &apos;var(--border)&apos;,
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
