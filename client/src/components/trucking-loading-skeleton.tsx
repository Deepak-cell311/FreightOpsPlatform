import { cn } from "@/lib/utils";

interface TruckingLoadingSkeletonProps {
  variant?: 'truck' | 'trailer' | 'road' | 'dashboard' | 'fleet' | 'load';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TruckingLoadingSkeleton({ 
  variant = 'truck', 
  size = 'md',
  className 
}: TruckingLoadingSkeletonProps) {
  const sizeClasses = {
    sm: 'h-16 w-32',
    md: 'h-24 w-48',
    lg: 'h-32 w-64'
  };

  if (variant === 'truck') {
    return (
      <div className={cn('relative overflow-hidden bg-gray-100 rounded-lg', sizeClasses[size], className)}>
        {/* Road */}
        <div className="absolute bottom-0 w-full h-2 bg-gray-300">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 animate-pulse"></div>
          {/* Road lines */}
          <div className="absolute top-0.5 w-full h-0.5 bg-white opacity-60">
            <div className="animate-road-lines w-full h-full bg-gradient-to-r from-transparent via-white to-transparent"></div>
          </div>
        </div>
        
        {/* Animated Truck */}
        <div className="absolute bottom-2 animate-truck-drive">
          {/* Truck Cab */}
          <div className="relative">
            <div className="w-8 h-6 bg-blue-400 rounded-tl-lg rounded-tr-sm animate-pulse"></div>
            {/* Windshield */}
            <div className="absolute top-1 left-1 w-6 h-2 bg-blue-200 rounded-sm animate-pulse delay-100"></div>
            {/* Front bumper */}
            <div className="absolute -right-1 top-4 w-1 h-3 bg-gray-400 animate-pulse delay-200"></div>
          </div>
          
          {/* Trailer */}
          <div className="absolute left-7 top-1 w-16 h-5 bg-gray-300 rounded animate-pulse delay-75">
            {/* Trailer details */}
            <div className="absolute top-1 left-1 right-1 h-0.5 bg-gray-400 animate-pulse delay-150"></div>
            <div className="absolute bottom-1 left-1 right-1 h-0.5 bg-gray-400 animate-pulse delay-200"></div>
          </div>
          
          {/* Wheels */}
          <div className="absolute bottom-0 left-1 w-2 h-2 bg-gray-600 rounded-full animate-spin-slow"></div>
          <div className="absolute bottom-0 left-5 w-2 h-2 bg-gray-600 rounded-full animate-spin-slow"></div>
          <div className="absolute bottom-0 left-8 w-2 h-2 bg-gray-600 rounded-full animate-spin-slow"></div>
          <div className="absolute bottom-0 left-20 w-2 h-2 bg-gray-600 rounded-full animate-spin-slow"></div>
        </div>

        {/* Loading shimmer effect */}
        <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
      </div>
    );
  }

  if (variant === 'road') {
    return (
      <div className={cn('relative overflow-hidden bg-gray-200 rounded-lg', className)}>
        {/* Road surface */}
        <div className="w-full h-full bg-gradient-to-b from-gray-300 to-gray-400 relative">
          {/* Center line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-yellow-400 transform -translate-y-1/2">
            <div className="animate-road-dash w-full h-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400"></div>
          </div>
          
          {/* Side lines */}
          <div className="absolute top-2 left-0 w-full h-0.5 bg-white animate-pulse"></div>
          <div className="absolute bottom-2 left-0 w-full h-0.5 bg-white animate-pulse delay-100"></div>
          
          {/* Moving truck silhouette */}
          <div className="absolute top-1/2 transform -translate-y-1/2 animate-truck-pass">
            <div className="w-6 h-3 bg-gray-600 rounded opacity-60"></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Header with truck icon */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-300 rounded animate-pulse">
            {/* Truck icon skeleton */}
            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-300 rounded animate-pulse"></div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse delay-75"></div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-8 bg-gray-300 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 150}ms` }}></div>
            </div>
          ))}
        </div>

        {/* Chart area with truck movement */}
        <div className="relative h-32 bg-gray-100 rounded overflow-hidden">
          <div className="absolute bottom-2 animate-truck-chart">
            <div className="w-4 h-2 bg-blue-400 rounded animate-pulse"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>
    );
  }

  if (variant === 'fleet') {
    return (
      <div className={cn('space-y-3', className)}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            {/* Truck status indicator */}
            <div className="relative">
              <div className="w-10 h-6 bg-green-300 rounded animate-pulse" style={{ animationDelay: `${i * 200}ms` }}>
                {/* Truck outline */}
                <div className="absolute inset-1 bg-green-400 rounded-sm animate-pulse" style={{ animationDelay: `${i * 250}ms` }}></div>
              </div>
              {/* Status dot */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" style={{ animationDelay: `${i * 300}ms` }}></div>
            </div>
            
            {/* Vehicle info */}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" style={{ animationDelay: `${i * 150}ms` }}></div>
            </div>

            {/* Speed indicator */}
            <div className="text-right space-y-1">
              <div className="h-6 w-12 bg-blue-300 rounded animate-pulse" style={{ animationDelay: `${i * 175}ms` }}></div>
              <div className="h-2 w-8 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 225}ms` }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'load') {
    return (
      <div className={cn('space-y-4', className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white">
            {/* Load header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {/* Package icon */}
                <div className="w-8 h-8 bg-orange-300 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-300 rounded animate-pulse" style={{ animationDelay: `${i * 150}ms` }}></div>
                </div>
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" style={{ animationDelay: `${i * 125}ms` }}></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 175}ms` }}></div>
                </div>
              </div>
              <div className="h-6 w-16 bg-green-300 rounded-full animate-pulse" style={{ animationDelay: `${i * 200}ms` }}></div>
            </div>

            {/* Route visualization */}
            <div className="relative h-8 bg-gray-100 rounded overflow-hidden">
              {/* Route line */}
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-400 transform -translate-y-1/2"></div>
              {/* Start point */}
              <div className="absolute top-1/2 left-2 w-3 h-3 bg-green-500 rounded-full transform -translate-y-1/2 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
              {/* End point */}
              <div className="absolute top-1/2 right-2 w-3 h-3 bg-red-500 rounded-full transform -translate-y-1/2 animate-pulse" style={{ animationDelay: `${i * 300}ms` }}></div>
              {/* Moving truck */}
              <div className="absolute top-1/2 transform -translate-y-1/2 animate-truck-route" style={{ animationDelay: `${i * 400}ms` }}>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>

            {/* Load details */}
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 125}ms` }}></div>
                <div className="h-4 w-20 bg-gray-300 rounded animate-pulse" style={{ animationDelay: `${i * 175}ms` }}></div>
              </div>
              <div className="space-y-1">
                <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 150}ms` }}></div>
                <div className="h-4 w-16 bg-gray-300 rounded animate-pulse" style={{ animationDelay: `${i * 200}ms` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default trailer variant
  return (
    <div className={cn('relative overflow-hidden bg-gray-100 rounded-lg', sizeClasses[size], className)}>
      {/* Trailer body */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 h-12 bg-gray-300 rounded animate-pulse">
        {/* Trailer details */}
        <div className="absolute top-2 left-2 right-2 h-1 bg-gray-400 animate-pulse delay-100"></div>
        <div className="absolute bottom-2 left-2 right-2 h-1 bg-gray-400 animate-pulse delay-200"></div>
        
        {/* Trailer doors */}
        <div className="absolute right-0 top-1 bottom-1 w-0.5 bg-gray-500 animate-pulse delay-150"></div>
      </div>
      
      {/* Wheels */}
      <div className="absolute bottom-2 left-1/4 w-3 h-3 bg-gray-600 rounded-full animate-spin-slow"></div>
      <div className="absolute bottom-2 right-1/4 w-3 h-3 bg-gray-600 rounded-full animate-spin-slow delay-100"></div>
      
      {/* Loading shimmer */}
      <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
    </div>
  );
}

export default TruckingLoadingSkeleton;