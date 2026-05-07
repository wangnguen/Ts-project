import mjml2html from 'mjml'

interface VerifyEmailParams {
  name: string
  verifyUrl: string
  expireMinutes: number
  appName: string
  supportEmail: string
}

export async function verifyEmailTemplate(params: VerifyEmailParams): Promise<string> {
  const { name, verifyUrl, expireMinutes, appName, supportEmail } = params

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

        <mj-section background-color="#ffffff" padding="40px 32px 32px 32px" border-radius="12px" css-class="main-card">
          <mj-column>
            <mj-image width="56px" src="https://cdn-icons-png.flaticon.com/512/561/561127.png" alt="Email icon" padding-bottom="24px" />

            <mj-text font-size="22px" font-weight="700" color="#111827" padding-bottom="8px">
              Xác thực địa chỉ email
            </mj-text>

            <mj-text padding-bottom="8px">
              Xin chào <strong>${name}</strong>,
            </mj-text>

            <mj-text padding-bottom="24px" color="#6b7280">
              Cảm ơn bạn đã đăng ký tài khoản tại <strong>${appName}</strong>.
              Vui lòng nhấn nút bên dưới để xác thực địa chỉ email và kích hoạt tài khoản của bạn.
            </mj-text>

            <mj-button
              href="${verifyUrl}"
              background-color="#4f46e5"
              color="#ffffff"
              border-radius="8px"
              padding="14px 0"
              inner-padding="14px 40px"
              font-size="15px"
              font-weight="600"
              letter-spacing="0.3px"
            >
              Xác thực email ngay
            </mj-button>

            <mj-divider border-color="#e5e7eb" padding="28px 0 20px 0" />

            <mj-text font-size="13px" color="#6b7280" padding-bottom="4px">
              ⏱ Link xác thực sẽ <strong>hết hạn sau ${expireMinutes} phút</strong>.
            </mj-text>

            <mj-text font-size="13px" color="#9ca3af">
              Nếu bạn không tạo tài khoản này, hãy bỏ qua email này — không có gì thay đổi.
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
