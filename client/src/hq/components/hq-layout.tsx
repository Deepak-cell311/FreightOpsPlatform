import { useState } from "react";
import HQSidebar from "@/hq/components/hq-sidebar";
import HQTopNavigation from "@/hq/components/hq-top-navigation";

interface HQLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  user?: any;
}

export default function HQLayout({ children, title, description, user }: HQLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <HQSidebar 
        user={user} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <HQTopNavigation 
          user={user} 
          title={title} 
          description={description}
          setSidebarOpen={setSidebarOpen}
        />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}