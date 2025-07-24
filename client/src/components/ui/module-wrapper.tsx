import { Suspense, ReactNode } from 'react';
import { ErrorBoundary, ModuleErrorBoundary } from './error-boundary';
import { ModuleLoadingSkeleton } from './loading-skeleton';

interface ModuleWrapperProps {
  children: ReactNode;
  moduleName: string;
  className?: string;
}

export function ModuleWrapper({ children, moduleName, className = "" }: ModuleWrapperProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <ModuleErrorBoundary moduleName={moduleName}>
        <Suspense fallback={<ModuleLoadingSkeleton moduleName={moduleName} />}>
          {children}
        </Suspense>
      </ModuleErrorBoundary>
    </div>
  );
}

export function TableWrapper({ children, title }: { children: ReactNode; title: string }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
          <div className="text-center py-8 text-gray-500">
            Unable to load table data. Please refresh the page.
          </div>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export function KPIWrapper({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-4 text-gray-500">
                Unable to load metrics
              </div>
            </div>
          ))}
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}