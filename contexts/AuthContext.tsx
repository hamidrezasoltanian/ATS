import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserWithPassword } from '../types';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

// Define a default user that is always "logged in".
const defaultUser: User = {
  username: 'admin',
  name: 'ادمین سیستم',
  isAdmin: true,
};

interface AuthContextType {
  user: User | null;
  users: Record<string, UserWithPassword>;
  login: (username: string, pass: string) => void;
  logout: () => void;
  addUser: (user: UserWithPassword) => void;
  updateUser: (username: string, userData: Partial<UserWithPassword>) => void;
  deleteUser: (username: string) => void;
  changePassword: (username: string, oldPass: string, newPass: string, isAdminOverride?: boolean) => void;
  currentUser: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(defaultUser);
  const [users, setUsers] = useState<Record<string, UserWithPassword>>(() => authService.getUsers());
  const { addToast } = useToast();

  useEffect(() => {
    authService.saveUsers(users);
  }, [users]);
  
  const login = () => {
     addToast('ورود خودکار فعال است.', 'success');
  };

  const logout = () => {
     addToast('خروج غیرفعال شده است.', 'error');
  };
  
  const addUser = (userData: UserWithPassword) => {
      if (users[userData.username.toLowerCase()]) {
          addToast('کاربر با این نام کاربری وجود دارد.', 'error');
          return;
      }
      setUsers(prev => ({...prev, [userData.username.toLowerCase()]: userData }));
      addToast('کاربر جدید با موفقیت اضافه شد.', 'success');
  }
  
  const updateUser = (username: string, userData: Partial<UserWithPassword>) => {
      setUsers(prev => ({...prev, [username]: { ...prev[username], ...userData }}));
      addToast('اطلاعات کاربر به‌روزرسانی شد.', 'success');
  }
  
  const deleteUser = (username: string) => {
      if (username.toLowerCase() === defaultUser.username) {
        addToast('شما نمی‌توانید کاربر پیش‌فرض سیستم را حذف کنید.', 'error');
        return;
      }
      const newUsers = {...users};
      delete newUsers[username.toLowerCase()];
      setUsers(newUsers);
      addToast('کاربر حذف شد.', 'success');
  }

  const changePassword = (username: string, oldPass: string, newPass: string, isAdminOverride: boolean = false) => {
      try {
          authService.changePassword(username, oldPass, newPass, isAdminOverride);
          setUsers(authService.getUsers());
          addToast('رمز عبور با موفقیت تغییر کرد.', 'success');
      } catch(e: any) {
          addToast(e.message, 'error');
      }
  }

  const value = { user, users, login, logout, addUser, updateUser, deleteUser, changePassword, currentUser: user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};