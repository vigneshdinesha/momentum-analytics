export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName?: string;
  lastName?: string;
  expiresAt: string;
}

export interface User {
  email: string;
  firstName?: string;
  lastName?: string;
}