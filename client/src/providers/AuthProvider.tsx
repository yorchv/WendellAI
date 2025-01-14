
import { createContext, useContext, ReactNode } from "react";
import { useUser } from "@/hooks/use-user";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  handlePublicRoute: (path: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useUser();
  
  const handlePublicRoute = (path: string) => {
    return path === "/" || path === "/auth";
  };

  const isAuthenticated = !!user;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, handlePublicRoute }}>
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
