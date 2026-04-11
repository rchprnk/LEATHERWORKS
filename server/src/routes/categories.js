import { Router } from 'express'
import supabase from '../supabase.js'

const router = Router()

function supabaseErrorStatus(error) {
  const status = Number(error?.status || error?.statusCode)
  if (Number.isFinite(status) && status >= 400 && status <= 599) return status
  return 500
}

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('categories')
    .select('id,name,description')
    .order('name', { ascending: true })

  if (error) return res.status(supabaseErrorStatus(error)).json({ error: error.message, code: error.code })
  res.json(data)
})

router.post('/', async (req, res) => {
  const { name, description = null } = req.body || {}
  if (!name || String(name).trim().length === 0) return res.status(400).json({ error: 'name is required' })

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name: String(name).trim(), description }])
    .select('id,name,description')
    .single()

  if (error) return res.status(supabaseErrorStatus(error)).json({ error: error.message, code: error.code })
  res.status(201).json(data)
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  if (!id) return res.status(400).json({ error: 'id is required' })

  const { data, error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .select('id')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return res.status(404).json({ error: 'Not found' })
    return res.status(supabaseErrorStatus(error)).json({ error: error.message, code: error.code })
  }

  res.json({ ok: true, id: data.id })
})

export default router

