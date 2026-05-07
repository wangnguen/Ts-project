import { Resend } from 'resend'

import { env } from '@common/config'

import { IEmailProvider, SendEmailParams } from './email.provider'

export class ResendProvider implements IEmailProvider {
  private resend = new Resend(env.RESEND_API_KEY)

  async send(params: SendEmailParams): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: env.MAIL_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html
    })

    if (error) throw error
  }
}
