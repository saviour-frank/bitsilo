import { forwardRef, ReactNode } from 'react';

export const PageContainer = forwardRef<HTMLElement, { children: ReactNode }>(
  ({ children }, ref) => (
    <main ref={ref} className="mx-auto w-full max-w-[1080px] px-4 py-6 lg:px-6 lg:py-8">
      {children}
    </main>
  )
);
PageContainer.displayName = 'PageContainer';
