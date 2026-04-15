import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  token: string | null;
  authStorage: any | null;
  login: (token: string, userData: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('token'));
  const [authStorage, setAuthStorageState] = useState<any | null>(
    JSON.parse(localStorage.getItem('authStorage') || 'null')
  );

  const login = (newToken: string, userData: any) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('authStorage', JSON.stringify(userData));
    setTokenState(newToken);
    setAuthStorageState(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authStorage');
    setTokenState(null);
    setAuthStorageState(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, authStorage, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
