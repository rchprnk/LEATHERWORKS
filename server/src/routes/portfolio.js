import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import supabase from '../supabase.js'
import { upload, uploadToPortfolioBucket, getPortfolioPathFromPublicUrl } from './upload.js'

const router = Router()

function supabaseErrorStatus(error) {
  const status = Number(error?.status || error?.statusCode)
  if (Number.isFinite(status) && status >= 400 && status <= 599) return status
  return 500
}

router.get('/', async (req, res) => {
  const page = Number(req.query.page || 1)
  const limit = Number(req.query.limit || 0)
  const category = req.query.category ? String(req.query.category) : null

  let q = supabase
    .from('portfolio')
    .select('*', limit > 0 ? { count: 'exact' } : undefined)
    .order('created_at', { ascending: false })

  if (category) {
    q = q.ilike('category', category)
  }

  if (limit > 0) {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 12
    const from = (safePage - 1) * safeLimit
    const to = from + safeLimit - 1
    q = q.range(from, to)
  }

  const { data, error, count } = await q

  if (error) return res.status(supabaseErrorStatus(error)).json({ error: error.message, code: error.code })

  if (limit > 0) {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 12
    const total = Number.isFinite(count) ? count : (data?.length || 0)
    const totalPages = Math.max(1, Math.ceil(total / safeLimit))
    return res.json({ data, page: safePage, limit: safeLimit, total, totalPages })
  }

  res.json(data)
})

router.post(
  '/',
  upload.fields([
    { name: 'before', maxCount: 1 },
    { name: 'after', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, description = null, category = null } = req.body || {}
      const beforeFile = req.files?.before?.[0]
      const afterFile = req.files?.after?.[0]

      if (!title) return res.status(400).json({ error: 'title is required' })
      if (!beforeFile) return res.status(400).json({ error: 'before file is required' })
      if (!afterFile) return res.status(400).json({ error: 'after file is required' })

      const workId = randomUUID()

      const beforeUpload = await uploadToPortfolioBucket(beforeFile, {
        prefix: `works/${workId}/before-`,
      })

      let afterUpload
      try {
        afterUpload = await uploadToPortfolioBucket(afterFile, {
          prefix: `works/${workId}/after-`,
        })
      } catch (e) {
        await supabase.storage.from('portfolio').remove([beforeUpload.path])
        throw e
      }

      const { data, error } = await supabase
        .from('portfolio')
        .insert([
          {
            title,
            description,
            category,
            before_url: beforeUpload.publicUrl,
            after_url: afterUpload.publicUrl,
          },
        ])
        .select('*')
        .single()

      if (error) {
        await supabase.storage.from('portfolio').remove([beforeUpload.path, afterUpload.path])
        return res.status(supabaseErrorStatus(error)).json({ error: error.message, code: error.code })
      }

      res.status(201).json(data)
    } catch (e) {
      const status = Number(e?.status || e?.statusCode)
      res.status(Number.isFinite(status) ? status : 500).json({ error: e?.message || 'Upload failed' })
    }
  }
)

router.delete('/:id', async (req, res) => {
  const { id } = req.params

  const { data: item, error: fetchError } = await supabase
    .from('portfolio')
    .select('id,before_url,after_url')
    .eq('id', id)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') return res.status(404).json({ error: 'Not found' })
    return res.status(supabaseErrorStatus(fetchError)).json({ error: fetchError.message, code: fetchError.code })
  }

  const paths = [
    getPortfolioPathFromPublicUrl(item.before_url),
    getPortfolioPathFromPublicUrl(item.after_url),
  ].filter(Boolean)

  if (paths.length) {
    const { error: storageError } = await supabase.storage.from('portfolio').remove(paths)
    if (storageError) return res.status(supabaseErrorStatus(storageError)).json({ error: storageError.message, code: storageError.code })
  }

  const { error: deleteError } = await supabase.from('portfolio').delete().eq('id', id)
  if (deleteError) return res.status(supabaseErrorStatus(deleteError)).json({ error: deleteError.message, code: deleteError.code })

  res.json({ ok: true, id })
})

export default router
