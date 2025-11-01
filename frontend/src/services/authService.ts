import { api } from './api';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';
import { tokenStorage } from '../utils/tokenStorage';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    tokenStorage.setToken(response.data.token);
    tokenStorage.setUser({
      email: response.data.email,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
    });
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    tokenStorage.setToken(response.data.token);
    tokenStorage.setUser({
      email: response.data.email,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
    });
    return response.data;
  },

  logout(): void {
    tokenStorage.removeToken();
  },

  isAuthenticated(): boolean {
    return tokenStorage.isAuthenticated();
  },

  getCurrentUser(): any {
    return tokenStorage.getUser();
  },
};