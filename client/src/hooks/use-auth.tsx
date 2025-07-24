import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  companyId: string;
  role: string;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phone: string;
  address: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Check for stored session on initialization with proper timeout
  const clearStoredSession = () => {
    try {
      localStorage.removeItem('freightops_session');
      queryClient.clear();
    } catch (error) {
      // Silent fail for localStorage issues
    }
  };
  
  const {
    data: user,
    error,
    isLoading,
    isSuccess,
    isError,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/user", {
          credentials: "include",
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData && userData.id) {
            return userData;
          }
        }
        
        // For 401/403 errors, clear session and return null (not authenticated)
        if (response.status === 401 || response.status === 403) {
          clearStoredSession();
          return null;
        }
        
        // For other errors, clear session and return null
        clearStoredSession();
        return null;
      } catch (error) {
        clearStoredSession();
        return null;
      }
    },
    retry: false,
    staleTime: 0, // Don't cache authentication checks
    gcTime: 0, // Don't cache authentication checks
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false,
    refetchOnReconnect: false
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (data: any) => {
      // Store session data in localStorage with 2-hour timeout
      localStorage.setItem('freightops_session', JSON.stringify({
        user: data.user,
        token: data.token,
        expiresAt: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
      }));
      
      // Set auth data immediately to prevent double render
      queryClient.setQueryData(["/api/user"], data.user);
      toast({
        title: "Login successful",
        description: "Welcome to FreightOps!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.setQueryData(["/api/user"], data.user);
      toast({
        title: "Registration successful",
        description: "Welcome to FreightOps! Your 30-day free trial has started.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await apiRequest("POST", "/api/logout");
      } catch (error) {
        // Even if server logout fails, we should clear local session
        console.warn("Server logout failed, clearing local session anyway");
      }
    },
    onSuccess: () => {
      // Immediate cleanup to stop all ongoing requests
      performLogoutCleanup();
    },
    onError: (error: Error) => {
      // Even on error, force logout locally
      performLogoutCleanup();
    },
  });

  const performLogoutCleanup = () => {
    // Clear all local session data
    localStorage.removeItem('freightops_session');
    localStorage.clear();
    sessionStorage.clear();
    
    // Cancel all ongoing queries to stop API calls immediately
    queryClient.cancelQueries();
    
    // Clear all React Query cache
    queryClient.clear();
    
    // Set user data to null to trigger authentication state change
    queryClient.setQueryData(["/api/user"], null);
    
    // Remove all cookies
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    // Show success message
    toast({
      title: "Logout successful",
      description: "You have been signed out.",
    });
    
    // Force redirect to login page to ensure completely clean state
    window.location.replace("/login");
  };

  // Show loading only during initial fetch, not after query completes (success or error)
  // Stop loading when we get any response (including 401 - unauthenticated is a valid state)
  const isActuallyLoading = isLoading && !isSuccess && !isError;

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: isActuallyLoading,
        isAuthenticated: !!user,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}