export interface AuthResponse {
    success: boolean;
    message: string;
    code: string;
}

export type Role = "COMPANY" | "ADMIN" | "MUNICIPAL_ADMIN" | "MUNICIPAL_EVALUATOR";

export interface LoginResponse extends AuthResponse {
    role: Role;
}