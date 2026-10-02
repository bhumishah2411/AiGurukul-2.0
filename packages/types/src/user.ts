export type UserRole = 'learner' | 'scholar' | 'admin';

export type SupportedLanguage = 'en' | 'sa' | 'hi' | 'ta';

export type WisdomPersona = 'krishna' | 'chanakya' | 'vaidya' | 'vyasa' | 'patanjali';

export interface UserPreferences {
  defaultPersona: WisdomPersona;
  language: SupportedLanguage;
  notificationsEnabled: boolean;
}

export interface OAuthProviderInfo {
  provider: 'google';
  providerId: string;
  email?: string;
}

export interface UserDTO {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  preferences: UserPreferences;
  isEmailVerified: boolean;
  oauthProviders?: OAuthProviderInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface SessionDTO {
  id: string;
  userId: string;
  isValid: boolean;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseData {
  user: UserDTO;
  tokens?: AuthTokens;
}

export interface JwtUserPayload {
  sub: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export interface RegisterRequestDTO {
  email: string;
  password: string;
  displayName: string;
  preferredPersona?: WisdomPersona;
  language?: SupportedLanguage;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface GoogleAuthRequestDTO {
  idToken: string;
}

export interface UpdateProfileDTO {
  displayName?: string;
  preferences?: Partial<UserPreferences>;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}
