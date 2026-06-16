import bcrypt from 'bcrypt';

export const validatePassword = async (password: string, dbPassword: string) => {
    return bcrypt.compare(password, dbPassword);
};