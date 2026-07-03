import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import { Request } from "express";

const TEMP_UPLOAD_DIR = process.env.VERCEL
    ? path.join(os.tmpdir(), "uploads")
    : path.join(process.cwd(), "uploads", "tmp");

fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, TEMP_UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (
        ALLOWED_MIME_TYPES.includes(file.mimetype) &&
        ALLOWED_EXTENSIONS.includes(ext)
    ) {
        cb(null, true);
    } else {
        cb(new Error("Solo se permiten archivos PDF, DOC o DOCX."));
    }
};

const limits = {
    fileSize: 10 * 1024 * 1024,
};

export const upload = multer({
    storage,
    fileFilter,
    limits,
});

export default upload;