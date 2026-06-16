import jwt, { JwtPayload } from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
const emailVerificationSecret = process.env.JWT_EMAIL_VERIFICATION_SECRET;

if (!secret || !refreshSecret || !emailVerificationSecret) {
    throw new Error('One or more JWT secrets are not defined in environment variables');
}

export const validateToken = (token: string): JwtPayload | null => {
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, secret) as JwtPayload;
        return decoded;
    } catch (error) {
        console.error('Token validation error:', error);
        return null;
    }
};

export const validateRefreshToken = (token: string): JwtPayload | null => {
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, refreshSecret) as JwtPayload;
        return decoded;
    } catch (error) {
        console.error('Refresh token validation error:', error);
        return null;
    }
};

export const validateEmailVerificationToken = (token: string): JwtPayload | null => {
    const sanitizedToken = decodeURIComponent(token).trim();
    if (!sanitizedToken) return null;
    try {
        const decoded = jwt.verify(sanitizedToken, emailVerificationSecret) as JwtPayload;
        return decoded;
    } catch (error) {
        console.error('Email verification token validation error:', error);
        return null;
    }
}