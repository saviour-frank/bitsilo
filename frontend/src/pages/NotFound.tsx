import { useEffect, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { ArrowLeft, Compass } from 'lucide-react';

const NotFound = forwardRef<HTMLElement>((_, ref) => {
  useEffect(() => { document.title = 'Page Not Found | BitSilo'; }, []);
  return (
    <PageContainer ref={ref}>
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-3">
          <Compass className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="mb-3 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-8 max-w-sm text-center text-base text-muted-foreground">
          This page doesn't exist. It might have been moved or you may have mistyped the URL.
        </p>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </PageContainer>
  );
});
NotFound.displayName = 'NotFound';
export default NotFound;
