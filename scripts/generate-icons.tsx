import { mkdirSync, writeFileSync } from "fs"
import { join } from "path"

import { ImageResponse } from "next/og"

const GRAPHITE = "#282828"
const LIME = "#C8DB12"

function Mark({
  size,
  padding,
  radius,
}: {
  size: number
  padding: number
  radius: number
}) {
  const inner = size - padding * 2
  const ringBorder = Math.round(inner * 0.09)
  const dot = Math.round(inner * 0.34)

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: GRAPHITE,
        borderRadius: radius,
      }}
    >
      <div
        style={{
          width: inner,
          height: inner,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          border: `${ringBorder}px solid ${LIME}`,
        }}
      >
        <div
          style={{
            width: dot,
            height: dot,
            borderRadius: "50%",
            background: LIME,
          }}
        />
      </div>
    </div>
  )
}

async function render(element: React.ReactElement, size: number) {
  const response = new ImageResponse(element, { width: size, height: size })
  return Buffer.from(await response.arrayBuffer())
}

async function main() {
  const outDir = join(process.cwd(), "public", "icons")
  mkdirSync(outDir, { recursive: true })

  writeFileSync(
    join(outDir, "icon-192.png"),
    await render(<Mark size={192} padding={0} radius={42} />, 192)
  )

  writeFileSync(
    join(outDir, "icon-512.png"),
    await render(<Mark size={512} padding={0} radius={112} />, 512)
  )

  writeFileSync(
    join(outDir, "icon-maskable-512.png"),
    await render(<Mark size={512} padding={51} radius={0} />, 512)
  )

  console.log("Иконки сгенерированы в public/icons/")
}

main()
