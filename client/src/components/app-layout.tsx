import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "./sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, isLoading: userLoading, error: userError } = useAuth();
  const { toast } = useToast();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  // Fetch companies for the current user
  const { 
    data: companies, 
    isLoading: companiesLoading, 
    error: companiesError 
  } = useQuery({
    queryKey: ["/api/companies"],
    enabled: !!user && !userError
  });

  // Handle auth error
  useEffect(() => {
    if (userError && isUnauthorizedError(userError)) {
      window.location.href = "/api/logout";
      return;
    }
  }, [userError]);

  // Handle companies error
  useEffect(() => {
    if (companiesError && !isUnauthorizedError(companiesError)) {
      toast({
        variant: "destructive",
        title: "Error loading companies",
        description: "There was a problem loading your company information.",
      });
      return;
    }
  }, [companiesError, toast]);

  // Set default company if available
  useEffect(() => {
    if (companies && Array.isArray(companies) && companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  // Show loading state
  if (userLoading || companiesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show error state if no companies
  if (!companies || !Array.isArray(companies) || companies.length === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">No Company Found</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600 mb-4">
              You need to be associated with a company to access the dashboard.
            </p>
            <Button onClick={() => window.location.href = "/api/logout"}>
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedCompany = Array.isArray(companies) ? companies.find((c: any) => c.id === selectedCompanyId) : null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Always visible and static */}
      <Sidebar user={user} company={selectedCompany} />
      
      {/* Main Content Area - positioned next to sidebar */}
      <div className="flex flex-col flex-1 ml-64 min-w-0">
        {children}
      </div>
    </div>
  );
}