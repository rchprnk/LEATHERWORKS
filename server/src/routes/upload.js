import multer from 'multer'
import { randomUUID } from 'node:crypto'
import supabase from '../supabase.js'

const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
})

function getFileExt(filename = '') {
  const idx = filename.lastIndexOf('.')
  if (idx === -1) return ''
  return filename.slice(idx + 1).toLowerCase()
}

export async function uploadToPortfolioBucket(file, { prefix = '' } = {}) {
  if (!file?.buffer) throw new Error('Missing file buffer')

  const ext = getFileExt(file.originalname)
  const safeExt = ext ? `.${ext}` : ''
  const path = `${prefix}${randomUUID()}${safeExt}`

  const { error: uploadError } = await supabase.storage
    .from('portfolio')
    .upload(path, file.buffer, {
      contentType: file.mimetype || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) {
    const err = new Error(uploadError.message)
    err.statusCode = uploadError.statusCode || uploadError.status || 500
    throw err
  }

  const { data } = supabase.storage.from('portfolio').getPublicUrl(path)
  if (!data?.publicUrl) throw new Error('Failed to generate public URL')

  return { path, publicUrl: data.publicUrl }
}

export function getPortfolioPathFromPublicUrl(publicUrl) {
  try {
    const url = new URL(publicUrl)
    const pathname = url.pathname || ''
    const marker = '/storage/v1/object/public/portfolio/'
    const idx = pathname.indexOf(marker)
    if (idx === -1) return null
    return pathname.slice(idx + marker.length)
  } catch {
    return null
  }
}

export async function uploadToCategoryImagesBucket(file, { prefix = '' } = {}) {
  if (!file?.buffer) throw new Error('Missing file buffer')

  const ext = getFileExt(file.originalname)
  const safeExt = ext ? `.${ext}` : ''
  const path = `${prefix}${randomUUID()}${safeExt}`

  const { error: uploadError } = await supabase.storage
    .from('category-images')
    .upload(path, file.buffer, {
      contentType: file.mimetype || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) {
    const err = new Error(uploadError.message)
    err.statusCode = uploadError.statusCode || uploadError.status || 500
    throw err
  }

  const { data } = supabase.storage.from('category-images').getPublicUrl(path)
  if (!data?.publicUrl) throw new Error('Failed to generate public URL')

  return { path, publicUrl: data.publicUrl }
}

export function getCategoryImagesPathFromPublicUrl(publicUrl) {
  try {
    const url = new URL(publicUrl)
    const pathname = url.pathname || ''
    const marker = '/storage/v1/object/public/category-images/'
    const idx = pathname.indexOf(marker)
    if (idx === -1) return null
    return pathname.slice(idx + marker.length)
  } catch {
    return null
  }
}
