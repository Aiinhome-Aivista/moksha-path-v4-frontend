import apiClient from './apiClient';
import type {
  AuthResponse,
  OtpVerifyPayload,
  RegisterPayload,
  SigninPayload,
  User,
} from '@/types';

/**
 * Auth service — all authentication-related API calls.
 * Components should use the `useAuth` hook or call these methods directly,
 * never import axios themselves.
 */
export const authService = {
  /** Request a one-time code to be sent to email or phone. */
  requestOtp: async (payload: SigninPayload): Promise<{ ok: true }> => {
    const { data } = await apiClient.post<{ ok: true }>('/auth/otp/request', payload);
    return data;
  },

  /** Verify OTP and receive a session token + user profile. */
  verifyOtp: async (payload: OtpVerifyPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/otp/verify', payload);
    return data;
  },

  /** Register a new account (multi-step wizard final submit). */
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  /** Initiate Google SSO (returns redirect URL). */
  googleSsoUrl: async (): Promise<{ url: string }> => {
    const { data } = await apiClient.get<{ url: string }>('/auth/google/url');
    return data;
  },

  /** Fetch the current authenticated user. */
  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },

  /** Sign out of the current session. */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
