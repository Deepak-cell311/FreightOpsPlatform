import { Button } from "@/components/ui/button";
import { Bell, Search } from "lucide-react";

interface TenantTopNavigationProps {
  user?: any;
  title: string;
  description?: string;
}

export default function TenantTopNavigation({ user, title, description }: TenantTopNavigationProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}