import { Button } from "@/components/ui/button";
import { Bell, Search, Menu, LogOut } from "lucide-react";

interface HQTopNavigationProps {
  user?: any;
  title: string;
  description?: string;
  setSidebarOpen: (open: boolean) => void;
}

export default function HQTopNavigation({ user, title, description, setSidebarOpen }: HQTopNavigationProps) {
  const handleLogout = () => {
    // Clear auth and redirect to login
    localStorage.removeItem('auth-token');
    window.location.href = '/hq-login';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}