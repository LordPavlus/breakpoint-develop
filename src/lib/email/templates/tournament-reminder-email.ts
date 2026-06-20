const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  weekday: "long",
  day: "numeric",
  month: "long",
})

const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
})

export function tournamentReminderEmailHtml({
  title,
  startsAt,
  location,
  tournamentUrl,
}: {
  title: string
  startsAt: Date
  location: string | null
  tournamentUrl: string
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
                  Напоминаем: завтра старт турнира <strong>«${title}»</strong>.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; border-radius: 8px; margin: 0 0 16px;">
                  <tr>
                    <td style="padding: 16px 20px; color:#282828; font-size: 14px;">
                      <p style="margin:0 0 8px;"><strong>Когда:</strong> ${dateFormatter.format(startsAt)}, ${timeFormatter.format(startsAt)}</p>
                      ${location ? `<p style="margin:0;"><strong>Где:</strong> ${location}</p>` : ""}
                    </td>
                  </tr>
                </table>
                <p style="margin: 0 0 16px; color:#71717a; font-size: 14px;">
                  Проверьте детали турнира и расписание матчей на странице турнира.
                </p>
                <a href="${tournamentUrl}" style="display:inline-block; padding: 12px 24px; background-color:#C8DB12; color:#282828; font-weight: 700; font-size: 14px; text-decoration:none; border-radius: 8px;">
                  Открыть турнир
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
