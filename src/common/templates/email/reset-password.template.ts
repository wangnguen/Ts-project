import mjml2html from 'mjml'

interface ResetPasswordParams {
  name: string
  code: string
  expireMinutes: number
  appName: string
  supportEmail: string
}

export async function resetPasswordTemplate(params: ResetPasswordParams): Promise<string> {
  const { name, code, expireMinutes, appName, supportEmail } = params

  const { html } = await mjml2html(`
    <mjml>
      <mj-head>
        <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
        <mj-attributes>
          <mj-all font-family="Inter, Arial, sans-serif" />
          <mj-text font-size="15px" line-height="26px" color="#374151" />
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#f3f4f6">

        <mj-section padding="24px 0 0 0">
          <mj-column>
            <mj-text align="center" font-size="20px" font-weight="700" color="#111827">
              ${appName}
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section background-color="#ffffff" padding="40px 32px 32px 32px" border-radius="12px">
          <mj-column>
            <mj-image width="56px" src="https://cdn-icons-png.flaticon.com/512/2889/2889676.png" alt="Lock icon" padding-bottom="24px" />

            <mj-text font-size="22px" font-weight="700" color="#111827" padding-bottom="8px">
              Đặt lại mật khẩu
            </mj-text>

            <mj-text padding-bottom="8px">
              Xin chào <strong>${name}</strong>,
            </mj-text>

            <mj-text padding-bottom="24px" color="#6b7280">
              Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại <strong>${appName}</strong>.
              Nhập mã bên dưới vào ô xác thực để tiếp tục.
            </mj-text>

            <mj-section background-color="#f5f3ff" border-radius="12px" padding="20px 0">
              <mj-column>
                <mj-text align="center" font-size="13px" color="#7c3aed" font-weight="600" padding-bottom="8px" letter-spacing="1px">
                  MÃ XÁC THỰC
                </mj-text>
                <mj-text align="center" font-size="40px" font-weight="700" color="#4f46e5" letter-spacing="10px" font-family="monospace, Courier New, Courier">
                  ${code}
                </mj-text>
              </mj-column>
            </mj-section>

            <mj-section background-color="#fef9c3" border-radius="8px" padding="14px 16px">
              <mj-column>
                <mj-text font-size="13px" color="#854d0e" padding="0">
                  ⚠️ Mã này sẽ <strong>hết hạn sau ${expireMinutes} phút</strong>.
                  Nếu hết hạn, bạn cần gửi lại yêu cầu mới.
                </mj-text>
              </mj-column>
            </mj-section>

            <mj-divider border-color="#e5e7eb" padding="24px 0 20px 0" />

            <mj-text font-size="13px" color="#9ca3af">
              Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
              Tài khoản của bạn vẫn an toàn.
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section padding="20px 0 28px 0">
          <mj-column>
            <mj-text align="center" font-size="12px" color="#9ca3af" padding-bottom="4px">
              © ${new Date().getFullYear()} ${appName}. Mọi quyền được bảo lưu.
            </mj-text>
            <mj-text align="center" font-size="12px" color="#9ca3af">
              Liên hệ hỗ trợ:
              <a href="mailto:${supportEmail}" style="color: #4f46e5; text-decoration: none;">${supportEmail}</a>
            </mj-text>
          </mj-column>
        </mj-section>

      </mj-body>
    </mjml>
  `)

  return html
}
