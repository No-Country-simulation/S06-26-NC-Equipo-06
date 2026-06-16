// src/errors/AppError.ts
export class AppError extends Error {
    public readonly success = false;
    public readonly code: string;
    public readonly details: any;

    constructor(
        public statusCode: number,
        message: string,
        code: string = 'INTERNAL_ERROR',
    ) {
        super(message);
        this.name = 'AppError';
        this.code = code;

        // Mejor compatibilidad con TypeScript
        Object.setPrototypeOf(this, AppError.prototype);
    }
}