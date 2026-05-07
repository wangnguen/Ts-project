import nodemailer from 'nodemailer'

import { env } from '@common/config'

import { IEmailProvider, SendEmailParams } from './email.provider'

export class NodemailerProvider implements IEmailProvider {
  private transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  })

  async send(params: SendEmailParams): Promise<void> {
    await this.transporter.sendMail({
      from: `"${env.APP_NAME}" <${env.MAIL_FROM}>`,
      to: params.to,
      subject: params.subject,
      html: params.html
    })
  }
}
