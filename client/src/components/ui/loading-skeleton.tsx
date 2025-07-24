import { Skeleton } from './skeleton';

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4">
              <Skeleton className="h-6 w-2/3 mb-2" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableLoadingSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <Skeleton className="h-6 w-1/4" />
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
      
      {/* Table */}
      <TableLoadingSkeleton />
    </div>
  );
}

export function ModuleLoadingSkeleton({ moduleName }: { moduleName: string }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Module-specific content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4">
              <Skeleton className="h-5 w-2/3 mb-2" />
              <Skeleton className="h-7 w-1/2 mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
        
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="h-5 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}