import React, { createContext, useContext, useEffect, useState } from 'react';
import { logoutUser } from '../services/bakeryService'; // Import logoutUser

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/validate-token', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error(error);
      }
    };
    checkAuth();
  }, []);

  const login = (token) => {
    document.cookie = `auth_token=${token}; path=/;`;
    setUser({ isAuthenticated: true });
  };

  const logout = async () => {
    try {
      await logoutUser(); // Use the imported logoutUser function
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);