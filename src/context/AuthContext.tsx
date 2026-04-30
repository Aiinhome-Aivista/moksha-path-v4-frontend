import { createContext, ReactNode, useState } from 'react';

export interface AuthContextValue {
  token: string | null;
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: any) => void;
  loginWithAuthResponse: (response: any) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  const [isLoading] = useState(false);

  const isAuthenticated = !!token;

  const login = (newToken: string, userData: any) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const loginWithAuthResponse = (response: any) => {
    if (response?.data?.token) {
        login(response.data.token, response.data.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isLoading, login, loginWithAuthResponse, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
