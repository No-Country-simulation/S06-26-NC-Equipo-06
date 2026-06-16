const jwt: any = require('jsonwebtoken');

export const generateToken = (payload: object) => {
    const secret = process.env.JWT_SECRET || '123456789';

    const options: any = {
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    };

    return jwt.sign(payload, secret, options);
};

export const generateRefreshTokenJwt = (payload: object) => {
    const secret = process.env.JWT_REFRESH_SECRET || '987654321';

    const options: any = {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    };

    return jwt.sign(payload, secret, options);
};

export const generateEmailVerificationToken = (payload: object) => {
    
    const secret = process.env.JWT_EMAIL_VERIFICATION_SECRET || 'email_verification_secret';

    const options: any = {
        expiresIn: process.env.JWT_EMAIL_VERIFICATION_EXPIRES_IN || "1d",
    };

    return jwt.sign(payload, secret, options);
}