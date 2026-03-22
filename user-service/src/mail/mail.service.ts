import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export interface SendMailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

@Injectable()
export class MailService {
    private transporter: Transporter;
    constructor(private configService: ConfigService) {
        const host = this.configService.get("SMTP_HOST");
        const user = this.configService.get("SMTP_USER");
        const pass = this.configService.get("SMTP_PASSWORD");
        const port = this.configService.get("SMTP_PORT");
        const secure = this.configService.get("SMTP_SECURE") === "true";
        const requireTLS = !secure && port;
        this.transporter = nodemailer.createTransport({
            host: host,
            port: port,
            secure: secure,
            requireTLS: requireTLS,
            auth: {
                user: user,
                pass: pass
            }
        });
        // if (host && user && pass) {
        //     const port = this.configService.get("SMTP_PORT");
        //     const secure = this.configService.get("SMTP_SECURE") === "true";
        //     this.transporter = nodemailer.createTransport({
        //         host: host,
        //         port: port,
        //         secure: secure,
        //         requireTLS: !secure && port,
        //         auth: {
        //             user: user,
        //             pass: pass
        //         }
        //     });
        // }
    }

    async sendMail(options: SendMailOptions) {
        if (!this.transporter) {
            throw new Error("Transporter not initialized");
        }
        const from = this.configService.get("SMTP_FROM");
        try {
            await this.transporter.sendMail({
                from: from,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html ?? options.text
            });
        } catch (error) {
            throw new Error("Failed to send email. Please try again later.");
        }
    }
}