export type UserRole = 'learner' | 'scholar' | 'admin';

export type SupportedLanguage = 'en' | 'sa' | 'hi' | 'ta';

export type WisdomPersona = 'krishna' | 'chanakya' | 'vaidya' | 'vyasa' | 'patanjali';

export interface UserPreferences {
  defaultPersona: WisdomPersona;
  language: SupportedLanguage;
  notificationsEnabled: boolean;
}

export interface UserDTO {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  preferences: UserPreferences;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
