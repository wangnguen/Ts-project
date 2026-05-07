import { env } from '@common/config'
import { RESET_PASSWORD_EXPIRE_MINUTES, VERIFY_EMAIL_EXPIRE_MINUTES } from '@common/constants'
import { IEmailProvider, SendEmailParams, NodemailerProvider, ResendProvider } from '@common/providers'
import { resetPasswordTemplate, verifyEmailTemplate } from '@common/templates'

class EmailService {
  private provider: IEmailProvider

  constructor() {
    this.provider = env.EMAIL_PROVIDER === 'resend' ? new ResendProvider() : new NodemailerProvider()
  }

  async sendVerifyEmail(email: string, token: string, name?: string) {
    const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${encodeURIComponent(token)}`

    const html = await verifyEmailTemplate({
      name: name || 'bạn',
      verifyUrl,
      expireMinutes: VERIFY_EMAIL_EXPIRE_MINUTES,
      appName: env.APP_NAME,
      supportEmail: env.MAIL_FROM
    })

    return this.sendEmail({ to: email, subject: 'Xác thực email của bạn', html })
  }

  async sendResetPasswordEmail(to: string, code: string, name?: string) {
    const html = await resetPasswordTemplate({
      name: name || 'bạn',
      code,
      expireMinutes: RESET_PASSWORD_EXPIRE_MINUTES,
      appName: env.APP_NAME,
      supportEmail: env.MAIL_FROM
    })

    return this.sendEmail({ to, subject: 'Đặt lại mật khẩu', html })
  }

  private async sendEmail(params: SendEmailParams): Promise<void> {
    await this.provider.send(params)
  }
}

export default EmailService
