
import { createContext, useContext, ReactNode } from "react";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  handleAuthRedirect: (path: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useUser();
  
  const handleAuthRedirect = (path: string) => {
    const isPublicRoute = path === "/" || path === "/auth";
    const isAuthenticated = !!user;

    if (!isAuthenticated && !isPublicRoute) {
      window.location.href = "/auth";
      return false;
    }
    return true;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!user, 
      isLoading, 
      handleAuthRedirect 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
