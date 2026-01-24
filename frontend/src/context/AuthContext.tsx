import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthContextType } from '../types';
import api from '../lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true to check session

  // Check for existing session on mount by calling /user/me endpoint
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get('/user/me');
        console.log("response data inside of auth contect: ",response.data);
        if (response.data.success) {
          const userData = response.data.user;
          setUser({
            id: userData._id,
            email: userData.email,
            name: userData.username,
          });
        }
      } catch (error: any) {
        // No valid session, user remains null
        console.log('No active session:', error.response?.status, error.response?.data?.message);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Real login function - calls backend API
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await api.post('/user/login', { email, password });

      if (response.data.success) {
        const userData = response.data.user;
        setUser({
          id: userData._id,
          email: userData.email,
          name: userData.username,
        });

        toast.success(response.data.message || 'Login successful!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Real signup function - calls backend API
  const signup = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await api.post('/user/register', {
        username: name,
        email,
        password,
      });

      if (response.data.success) {
        const userData = response.data.newUser;
        setUser({
          id: userData._id,
          email: userData.email,
          name: userData.username,
        });

        toast.success(response.data.message || 'Registration successful!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/user/logout');
      setUser(null);
      toast.success('Logged out successfully!');
    } catch (error: any) {
      console.error('Logout error:', error);
      setUser(null); // Clear user anyway
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        signup,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
