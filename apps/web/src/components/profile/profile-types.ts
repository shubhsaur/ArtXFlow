export interface ProfileFormData {
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  canonicalUrl: string;
  bio: string;
}

export interface SecurityTelemetry {
  ssoProvider: string;
  ssoAccountId: string;
  ssoActive: boolean;
  hasPassword: boolean;
}

