/**
 * Authentication-related types and session data structures.
 */

export interface Session {
  user: {
    id: string
    email: string
    name: string
    role: 'SUBMITTER' | 'ADMIN'
  }
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}
