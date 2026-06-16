import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const createTransporter = () => nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export type SendEmailParams = {
    to: string;
    subject: string;
    html: string;
};

const transporter = createTransporter();

export const sendEmail = async ({ to, subject, html }: SendEmailParams): Promise<SMTPTransport.SentMessageInfo> => {
    try {

        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
            to,
            subject,
            html
        });

        console.log("Email enviado:", info.messageId);
        return info;

    } catch (error) {
        console.error("Error al enviar email:", error);
        throw new Error("EMAIL_SEND_FAIL");
    }
};

export const verifyEmailConnection = async (): Promise<void> => {
    try {
        await transporter.verify();
        console.log("SMTP conectado correctamente");
    } catch (error) {
        console.error("SMTP no disponible:", error);
    }
};
