export const tokenStorage = {
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
  
  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },
  
  removeToken: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
  
  getUser: (): any | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  setUser: (user: any): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },
};