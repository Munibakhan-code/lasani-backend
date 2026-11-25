import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../config/logger';

interface SendArgs { to: string; subject: string; html: string; text?: string }

let transporter: nodemailer.Transporter | null = null;
if (env.EMAIL_PROVIDER === 'smtp' && env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: (env.SMTP_PORT ?? 587) === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
}

export const emailService = {
  async send({ to, subject, html, text }: SendArgs): Promise<void> {
    if (!transporter) {
      logger.warn({ to, subject }, 'Email transport not configured — skipping send (dev mode)');
      return;
    }
    await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html, text });
  },
};