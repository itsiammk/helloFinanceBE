// src/types/auth.types.ts
export interface SignupRequest {
    name: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: UserResponse;
}