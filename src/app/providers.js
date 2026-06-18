'use client';

import * as React from 'react';
import { RouterProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function Providers({ children }) {
  return (
    <RouterProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <main className="min-h-screen bg-background text-foreground tracking-tight">
          {children}
        </main>
      </NextThemesProvider>
    </RouterProvider>
  );
}
