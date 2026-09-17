export function fileToCompressedDataUrl(
  file: File,
  maxDimension = 800,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not read the selected image'))
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > maxDimension) {
          height = Math.round(height * (maxDimension / width))
          width = maxDimension
        } else if (height > maxDimension) {
          width = Math.round(width * (maxDimension / height))
          height = maxDimension
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

function loadImageFromSrc(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image for comparison'))
    img.src = src
  })
}

function samplePixels(img: HTMLImageElement, size: number): Uint8ClampedArray {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, size, size)
  return ctx.getImageData(0, 0, size, size).data
}

export async function computeVisualChangePercent(
  beforeSrc: string,
  afterSrc: string
): Promise<number> {
  const size = 32
  const [beforeImg, afterImg] = await Promise.all([
    loadImageFromSrc(beforeSrc),
    loadImageFromSrc(afterSrc),
  ])
  const before = samplePixels(beforeImg, size)
  const after = samplePixels(afterImg, size)
  let totalDiff = 0
  const pixelCount = size * size
  for (let i = 0; i < before.length; i += 4) {
    totalDiff +=
      (Math.abs(before[i]! - after[i]!) +
        Math.abs(before[i + 1]! - after[i + 1]!) +
        Math.abs(before[i + 2]! - after[i + 2]!)) /
      3
  }
  const meanDiff = totalDiff / pixelCount
  const normalized = Math.min(1, meanDiff / 90)
  return Math.max(3, Math.min(99, Math.round(normalized * 100)))
}
