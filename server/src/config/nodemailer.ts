import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const createTransporter = () => {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        throw new Error("SMTP_CONFIG_MISSING: SMTP_HOST, SMTP_USER y SMTP_PASS son requeridos");
    }

    return nodemailer.createTransport({
        host,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: { user, pass },
        pool: true,
        maxConnections: 5,
        socketTimeout: 10_000,
    });
};

export type SendEmailParams = {
    to: string | string[];
    subject: string;
    html: string;
    replyTo?: string;
};

let transporter: ReturnType<typeof createTransporter> | null = null;

const getTransporter = () => {
    if (!transporter) {
        transporter = createTransporter();
    }
    return transporter;
};

export const sendEmail = async ({
    to,
    subject,
    html
}: SendEmailParams): Promise<SMTPTransport.SentMessageInfo> => {
    const from = process.env.SMTP_FROM_EMAIL;

    if (!from) {
        throw new Error("SMTP_CONFIG_MISSING: SMTP_FROM_EMAIL es requerido");
    }

    const info = await getTransporter().sendMail({
        from: process.env.SMTP_FROM_NAME
            ? `"${process.env.SMTP_FROM_NAME}" <${from}>`
            : from,
        to,
        subject,
        html
    });

    console.log("Email enviado:", info.messageId);
    return info as unknown as SMTPTransport.SentMessageInfo;
};

export const verifyEmailConnection = async (): Promise<void> => {
    await getTransporter().verify();
    console.log("SMTP conectado correctamente");
};