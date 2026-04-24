export type Persona = 'student' | 'parent' | 'teacher' | 'institution';

export type ContactMethod = 'email' | 'phone';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  persona: Persona;
  board?: string;
  grade?: string;
  school?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SigninPayload {
  method: ContactMethod;
  email?: string;
  phone?: string;
}

export interface RegisterPayload {
  persona: Persona;
  name: string;
  email?: string;
  phone?: string;
  board?: string;
  grade?: string;
  school?: string;
  subjects?: string[];
  grades?: string[];
  role?: string;
  childName?: string;
  childGrade?: string;
  childBoard?: string;
  enrollmentSize?: string;
  primaryBoard?: string;
}

export interface OtpVerifyPayload {
  destination: string;
  method: ContactMethod;
  code: string;
}
