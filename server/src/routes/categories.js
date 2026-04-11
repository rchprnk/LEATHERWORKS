import { Router } from 'express'
import supabase from '../supabase.js'
import { upload, uploadToCategoryImagesBucket, getCategoryImagesPathFromPublicUrl } from './upload.js'

const router = Router()

function supabaseErrorStatus(error) {
  const status = Number(error?.status || error?.statusCode)
  if (Number.isFinite(status) && status >= 400 && status <= 599) return status
  return 500
}

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('categories')
    .select('id,name,description,img_categories')
    .order('name', { ascending: true })

  if (error) return res.status(supabaseErrorStatus(error)).json({ error: error.message, code: error.code })
  res.json(data)
})

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description = null } = req.body || {}
    if (!name || String(name).trim().length === 0) return res.status(400).json({ error: 'name is required' })

    const imageFile = req.file
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp'])
    if (imageFile) {
      if (imageFile.size > 2 * 1024 * 1024) return res.status(400).json({ error: 'Image must be <= 2MB' })
      if (!allowed.has(imageFile.mimetype)) return res.status(400).json({ error: 'Only JPG, PNG, and WEBP are allowed' })
    }

    let publicUrl = null
    let uploadedPath = null
    if (imageFile) {
      const uploaded = await uploadToCategoryImagesBucket(imageFile, { prefix: 'categories/' })
      publicUrl = uploaded.publicUrl
      uploadedPath = uploaded.path
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          name: String(name).trim(),
          description,
          img_categories: publicUrl,
        },
      ])
      .select('id,name,description,img_categories')
      .single()

    if (error) {
      if (uploadedPath) await supabase.storage.from('category-images').remove([uploadedPath])
      return res.status(supabaseErrorStatus(error)).json({ error: error.message, code: error.code })
    }

    res.status(201).json(data)
  } catch (e) {
    const status = Number(e?.status || e?.statusCode)
    res.status(Number.isFinite(status) ? status : 500).json({ error: e?.message || 'Failed to create category' })
  }
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { name, description = null } = req.body || {}

  if (!id) return res.status(400).json({ error: 'id is required' })
  if (!name || String(name).trim().length === 0) return res.status(400).json({ error: 'name is required' })

  const { data, error } = await supabase
    .from('categories')
    .update({
      name: String(name).trim(),
      description,
    })
    .eq('id', id)
    .select('id,name,description,img_categories')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return res.status(404).json({ error: 'Not found' })
    return res.status(supabaseErrorStatus(error)).json({ error: error.message, code: error.code })
  }

  res.json(data)
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  if (!id) return res.status(400).json({ error: 'id is required' })

  const { data: cat, error: fetchError } = await supabase
    .from('categories')
    .select('id,img_categories')
    .eq('id', id)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') return res.status(404).json({ error: 'Not found' })
    return res.status(supabaseErrorStatus(fetchError)).json({ error: fetchError.message, code: fetchError.code })
  }

  const imgPath = getCategoryImagesPathFromPublicUrl(cat.img_categories)
  if (imgPath) {
    const { error: storageError } = await supabase.storage.from('category-images').remove([imgPath])
    if (storageError) return res.status(supabaseErrorStatus(storageError)).json({ error: storageError.message, code: storageError.code })
  }

  const { error: deleteError } = await supabase.from('categories').delete().eq('id', id)
  if (deleteError) return res.status(supabaseErrorStatus(deleteError)).json({ error: deleteError.message, code: deleteError.code })

  res.json({ ok: true, id: cat.id })
})

export default router
