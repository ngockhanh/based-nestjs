export interface AccessToken {
  access: string;
  expiration: number;
}
export interface AuthTokens extends AccessToken {
  refresh: string;
}

export interface UserPreferences {
  timezone: string;
}

export interface AuthUserData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: {
    id: number;
    name: string;
    level: number | null;
  },
  permissions: string[];
  isSuperAdmin: boolean;
  preferences: UserPreferences | null;
  adminAppUserId: number | null;
}
