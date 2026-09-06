const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ??
  'http://localhost/RCA/backend/api'

export function resolveImageUrl(image: string): string {
  if (!image?.trim()) {
    return image
  }

  if (image.startsWith('blob:') || image.startsWith('data:')) {
    return image
  }

  const uploadBase = apiBaseUrl.replace(/\/api\/?$/, '')

  const uploadsPath = image.match(/\/uploads\/(?:categories|products)\/[^\s?#]+/i)
  if (uploadsPath) {
    return `${uploadBase}${uploadsPath[0]}`
  }

  if (/^(https?:)?\/\//i.test(image)) {
    return image
  }

  return image.startsWith('/') ? `${uploadBase}${image}` : `${uploadBase}/${image}`
}
