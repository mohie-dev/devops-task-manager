import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        const host = this.configService.get<string>('MAIL_HOST', 'sandbox.smtp.mailtrap.io');
        const port = this.configService.get<number>('MAIL_PORT', 587);
        const user = this.configService.get<string>('MAIL_USER');
        const pass = this.configService.get<string>('MAIL_PASS');

        this.logger.log(`Connecting to SMTP Host via ConfigService: ${host}:${port}`);

        this.transporter = nodemailer.createTransport({
            host,
            port: Number(port),
            secure: false,
            auth: {
                user,
                pass,
            },
            connectionTimeout: 5000,
            socketTimeout: 5000,
        });
    }

    async sendVerificationEmail(toEmail: string, verificationToken: string): Promise<boolean> {
        const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
        const fromEmail = this.configService.get<string>('MAIL_FROM', 'no-reply@devops-task-manager.com');
        const verificationUrl = `${appUrl}/api/auth/verify-email?token=${verificationToken}`;

        const mailOptions = {
            from: `"DevOps Task Manager" <${fromEmail}>`,
            to: toEmail,
            subject: 'Verify your email address 🚀',
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #2c3e50;">Welcome to DevOps Task Manager!</h2>
          <p>Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationUrl}" style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
        </div>
      `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send email to ${toEmail}: ${error}`);
            return false;
        }
    }
}