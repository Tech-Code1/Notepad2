// src/frontend/types/user.ts
export interface User {
  id: string;
  email: string;
  displayName?: string;
  provider: string; // 'local', 'google', 'github'
  avatarUrl?: string;
  profile?: any; // Additional profile data
  createdAt?: Date; 
  updatedAt?: Date;
}
