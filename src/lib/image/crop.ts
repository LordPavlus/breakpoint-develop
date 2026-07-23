export type PixelCrop = { x: number; y: number; width: number; height: number }

const OUTPUT_SIZE = 512

// Вырезает область изображения (в пикселях исходника, из react-easy-crop
// onCropComplete) и рендерит в квадратный канвас фиксированного размера —
// аватары не нужно хранить в оригинальном разрешении.
export async function getCroppedImageBlob(
  imageSrc: string,
  crop: PixelCrop,
  contentType: string
): Promise<Blob> {
  const image = await loadImage(imageSrc)

  const canvas = document.createElement("canvas")
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE

  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Canvas недоступен")
  }

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Не удалось обработать изображение"))),
      contentType,
      0.92
    )
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", () => reject(new Error("Не удалось загрузить изображение")))
    image.src = src
  })
}
