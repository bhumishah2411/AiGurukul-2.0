'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';
import { UserDTO, RegisterRequestDTO, LoginRequestDTO } from '@ai-gurukul/types';

export function useAuth() {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiClient<{ user: UserDTO }>('/auth/me');
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (dto: LoginRequestDTO): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const res = await apiClient<{ user: UserDTO }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    });

    if (res.success && res.data?.user) {
      setUser(res.data.user);
      setLoading(false);
      return true;
    } else {
      setError(res.error?.message || 'Authentication failed');
      setLoading(false);
      return false;
    }
  };

  const register = async (dto: RegisterRequestDTO): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const res = await apiClient<{ user: UserDTO }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(dto),
    });

    if (res.success && res.data?.user) {
      setUser(res.data.user);
      setLoading(false);
      return true;
    } else {
      setError(res.error?.message || 'Registration failed');
      setLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    await apiClient('/auth/logout', { method: 'POST' });
    setUser(null);
    setLoading(false);
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshProfile: fetchProfile,
  };
}
