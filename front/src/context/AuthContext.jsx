import { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin } from '../api/auth';
import { getToken, setToken, clearToken } from '../api/client';

const AuthContext = createContext(null);
const USER_KEY = 'printshop_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    const storedUser = localStorage.getItem(USER_KEY);
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setReady(true);
  }, []);

  async function login(username, password) {
    const { token, user: loggedInUser } = await apiLogin(username, password);
    setToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }

  function logout() {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}