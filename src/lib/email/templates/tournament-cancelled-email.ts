export function tournamentCancelledEmailHtml({
  title,
  refunded,
}: {
  title: string
  refunded: boolean
}): string {
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
              <td style="padding: 32px 24px;">
                <p style="margin:0 0 16px; color:#282828; font-size: 16px;">
                  Турнир <strong>«${title}»</strong> отменён из-за нехватки участников.
                </p>
                <p style="margin:0; color:#282828; font-size: 14px;">
                  ${
                    refunded
                      ? "Взнос за участие возвращён на способ оплаты, указанный при регистрации — поступление средств может занять несколько рабочих дней."
                      : "Взнос за участие не был списан, дополнительных действий не требуется."
                  }
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}
