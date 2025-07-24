import { useState } from "react";
import HQSidebar from "./hq-sidebar";
import HQTopNavigation from "./hq-top-navigation";

interface HQLayoutProps {
  children: React.ReactNode;
  user?: any;
}

export default function HQLayout({ children, user }: HQLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <HQSidebar user={user} />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navigation */}
        <HQTopNavigation 
          user={user} 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
        />

        {/* Page Content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}