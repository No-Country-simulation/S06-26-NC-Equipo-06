// fileHelpers.ts
import fs from "fs";
import path from "path";

const sanitizeFolderName = (name: string): string => {
    return name
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .replace(/\s+/g, "_");
};

const BASE_UPLOAD_DIR = path.join(__dirname, "..", "uploads", "tenders", "documents");

export const moveFilesToTenderFolder = (
    files: Express.Multer.File[],
    tenderName: string
): string[] => {
    const folderName = sanitizeFolderName(tenderName);
    const destDir = path.join(BASE_UPLOAD_DIR, folderName);

    fs.mkdirSync(destDir, { recursive: true });

    const newPaths: string[] = [];

    for (const file of files) {
        const destPath = path.join(destDir, file.filename);
        fs.renameSync(file.path, destPath);
        newPaths.push(destPath);
    }

    return newPaths;
};