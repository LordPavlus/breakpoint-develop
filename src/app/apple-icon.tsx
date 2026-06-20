import { ImageResponse } from "next/og"

export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

const GRAPHITE = "#282828"
const LIME = "#C8DB12"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: GRAPHITE,
        }}
      >
        <div
          style={{
            width: 124,
            height: 124,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            border: `11px solid ${LIME}`,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: LIME,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  )
}
