import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const [location] = useLocation();
  const [previousLocation, setPreviousLocation] = useState(location);
  const [shouldTransition, setShouldTransition] = useState(false);

  useEffect(() => {
    // Only trigger transition for major route changes, not submenu changes
    const isMajorRouteChange = () => {
      const currentBase = location.split('/')[1] || '';
      const previousBase = previousLocation.split('/')[1] || '';
      return currentBase !== previousBase;
    };

    if (location !== previousLocation && isMajorRouteChange()) {
      setShouldTransition(true);
      setPreviousLocation(location);
      
      const timer = setTimeout(() => {
        setShouldTransition(false);
      }, 150);

      return () => clearTimeout(timer);
    } else if (location !== previousLocation) {
      // For submenu navigation, just update location without transition
      setPreviousLocation(location);
    }
  }, [location, previousLocation]);

  return (
    <div className="w-full h-full">
      <div 
        className={`w-full h-full p-4 lg:p-6 ${
          shouldTransition 
            ? 'transition-opacity duration-150 ease-in-out opacity-90' 
            : 'opacity-100'
        }`}
        style={{ minHeight: 'calc(100vh - 200px)' }}
      >
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </div>
    </div>
  );
}