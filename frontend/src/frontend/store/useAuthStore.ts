// src/frontend/store/useAuthStore.ts
import { create } from 'zustand';
import { User } from '../types/user'; // Adjust path if your folder structure is different

// TODO: Define these properly, perhaps in a separate types file shared with views
export interface LoginCredentials { email: string; password: string; }
export interface RegisterData { email: string; password: string; displayName?: string; }

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuthError: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  handleOAuthToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUserFromToken: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => {
    set({ token });
    if (token) {
      // TODO: Persist token to secure storage (e.g., Electron Store or keytar)
      console.log("Token set. TODO: Persist to secure storage.");
    } else {
      // TODO: Remove token from secure storage
      console.log("Token cleared. TODO: Remove from secure storage.");
    }
  },
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }), // Also set isLoading false on error
  clearAuthError: () => set({ error: null }),

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    console.log('Attempting login with (mocked):', credentials);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (credentials.email && !credentials.email.includes("fail")) { // Simulate success
      const mockUser: User = {
        id: `user-local-${Date.now()}`, // More unique ID
        email: credentials.email,
        provider: 'local',
        displayName: `User ${credentials.email.split('@')[0]}`, // Basic display name
        avatarUrl: `https://i.pravatar.cc/150?u=${credentials.email}`, // Placeholder avatar
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockToken = `mock-jwt-${Date.now()}`;
      
      get().setUser(mockUser);
      get().setToken(mockToken); // This will log "Token set. TODO: Persist..."
      set({ isLoading: false });
      console.log('Mock login successful for:', credentials.email);
    } else { // Simulate failure
      get().setUser(null); // Ensure user and token are cleared on failed login
      get().setToken(null);
      set({ error: 'Login failed: Invalid credentials (mock)', isLoading: false });
      console.log('Mock login failed for:', credentials.email);
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    console.log('Attempting registration with (mocked):', data);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (data.email && !data.email.includes("exist") && !data.email.includes("fail")) {
      const mockUser: User = {
        id: `user-local-${Date.now()}`,
        email: data.email,
        provider: 'local',
        displayName: data.displayName || `User ${data.email.split('@')[0]}`,
        avatarUrl: `https://i.pravatar.cc/150?u=${data.email}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockToken = `mock-jwt-register-${Date.now()}`;
      
      get().setUser(mockUser);
      get().setToken(mockToken);
      set({ isLoading: false });
      console.log('Mock registration successful for:', data.email);
    } else {
      get().setUser(null);
      get().setToken(null);
      set({ error: 'Registration failed: Email already exists (mock)', isLoading: false });
      console.log('Mock registration failed for:', data.email);
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    console.log('loginWithGoogle action placeholder. TODO: IPC to main process.');
    // Simulate that main process interaction is pending
    // isLoading will be set to false by handleOAuthToken or if an error occurs in this setup phase
  },

  loginWithGitHub: async () => {
    set({ isLoading: true, error: null });
    console.log('loginWithGitHub action placeholder. TODO: IPC to main process.');
  },

  handleOAuthToken: async (token: string) => {
    set({ isLoading: true, error: null });
    console.log('handleOAuthToken received token (simulated):', token);
    // In a real scenario, you'd use this token to fetch user profile from your backend
    // For example: GET /auth/profile with Authorization: Bearer <token>
    // That backend call would return your app's own JWT and user object if successful.
    // Here, we'll simulate that process.
    await new Promise(resolve => setTimeout(resolve, 500));
    if (token && token.startsWith("simulated-oauth-token-")) { // Check if it's a simulated valid token
      const provider = token.includes("google") ? "google" : "github";
      const mockUser: User = { 
        id: `user-${provider}-123`, 
        email: `${provider}user@example.com`, 
        provider: provider, 
        displayName: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User` 
      };
      const appSpecificJwt = `mock-app-jwt-for-${provider}-${Date.now()}`;
      
      get().setToken(appSpecificJwt); // Set our app's JWT
      get().setUser(mockUser);
      set({ isLoading: false });
      console.log(`OAuth flow for ${provider} successful. App token and user set.`);
    } else {
      get().setToken(null);
      get().setUser(null);
      set({ error: 'Failed to validate OAuth session or invalid token received.', isLoading: false });
    }
  },

  logout: async () => {
    console.log('logout action: clearing user and token.');
    // TODO: Call backend /auth/logout if it exists
    get().setUser(null);
    get().setToken(null); // This will trigger the TODO for removing from storage
  },

  loadUserFromToken: async () => {
    // TODO: Load token from secure storage
    // const storedToken = await someAsyncSecureStorage.getItem('app_token');
    const storedToken: string | null = null; // Placeholder: no token found initially
    console.log('loadUserFromToken: checking for stored token (simulated).');

    if (storedToken) {
      set({ isLoading: true });
      // Placeholder: validate token and fetch user profile
      await new Promise(resolve => setTimeout(resolve, 500));
      // Simulate token validation and profile fetch
      // const mockUser: User = { id: 'user-loaded-123', email: 'loaded@example.com', provider: 'local', displayName: 'Loaded User' };
      // get().setToken(storedToken);
      // get().setUser(mockUser);
      // set({ isLoading: false });
      console.log('loadUserFromToken: Token found and user loaded (simulated).');
    } else {
      console.log('loadUserFromToken: No stored token found.');
      // No need to set isLoading if no token, as nothing is being loaded.
    }
  },
}));

export default useAuthStore;
