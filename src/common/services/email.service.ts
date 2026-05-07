import { Resend } from 'resend'

import { env } from '@common/config'
import { RESET_PASSWORD_EXPIRE_MINUTES, VERIFY_EMAIL_EXPIRE_MINUTES } from '@common/constants'
import { resetPasswordTemplate } from '@common/templates/email/reset-password.template'
import { verifyEmailTemplate } from '@common/templates/email/verify-email.template'

class EmailService {
  private resend = new Resend(env.RESEND_API_KEY)

  async sendVerifyEmail(email: string, token: string, name?: string) {
    const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${encodeURIComponent(token)}`

    const html = await verifyEmailTemplate({
      name: name || 'bạn',
      verifyUrl,
      expireMinutes: VERIFY_EMAIL_EXPIRE_MINUTES,
      appName: env.APP_NAME,
      supportEmail: env.RESEND_FROM
    })

    return this.sendEmail({ to: email, subject: 'Xác thực email của bạn', html })
  }

  async sendResetPasswordEmail(to: string, code: string, name?: string) {
    const html = await resetPasswordTemplate({
      name: name || 'bạn',
      code,
      expireMinutes: RESET_PASSWORD_EXPIRE_MINUTES,
      appName: env.APP_NAME,
      supportEmail: env.RESEND_FROM
    })

    return this.sendEmail({ to, subject: 'Đặt lại mật khẩu', html })
  }

  private async sendEmail(params: { to: string; subject: string; html: string }) {
    const { data, error } = await this.resend.emails.send({
      from: env.RESEND_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html
    })

    if (error) throw error

    return data
  }
}

export default EmailService
