import webpush from "web-push"

export const pushConfigured = Boolean(
  process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
)

if (pushConfigured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:support@breakpoint.moscow",
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
}

export { webpush }
