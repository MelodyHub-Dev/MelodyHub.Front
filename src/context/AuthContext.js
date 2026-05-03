import { createContext, useContext, useState } from "react";
import { getSession, saveSession, clearSession } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(getSession);

  const login = (data) => {
    saveSession(data);
    setCurrentUser(data);
  };

  const logout = () => {
    clearSession();
    setCurrentUser(null);
  };

  const updateUser = (patch) => {
    const updated = { ...currentUser, ...patch };
    saveSession(updated);
    setCurrentUser(updated);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
