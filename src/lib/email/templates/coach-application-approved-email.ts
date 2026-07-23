export function coachApplicationApprovedEmailHtml({ coachUrl }: { coachUrl: string }): string {
  return `<!DOCTYPE html>
<html lang="ru">
  <body style="margin:0; padding:0; background-color:#f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width: 480px; background-color:#ffffff; border-radius: 12px; overflow: hidden;" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background-color:#282828; padding: 24px; text-align:center;">
                <span style="color:#C8DB12; font-size: 20px; font-weight: 700;">Break Point</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 24px; text-align:center;">
                <p style="margin:0 0 16px; color:#282828; font-size: 16px;">
                  Отличные новости — ваша заявка на статус тренера <strong>одобрена</strong>!
                </p>
                <p style="margin:0 0 24px; color:#282828; font-size: 14px;">
                  Теперь вам доступен личный кабинет тренера: заполните профиль, добавьте
                  специализацию и создайте первые слоты для тренировок.
                </p>
                <a href="${coachUrl}" style="display:inline-block; padding: 12px 32px; background-color:#C8DB12; color:#282828; font-weight:700; font-size:14px; text-decoration:none; border-radius:8px;">
                  Перейти в кабинет тренера
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}
