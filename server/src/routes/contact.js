import { Router } from 'express'
import supabase from '../supabase.js'

const router = Router()

const CONTACTS_TABLE = process.env.CONTACTS_TABLE || 'contacts'

function supabaseErrorStatus(error) {
  const status = Number(error?.status || error?.statusCode)
  if (Number.isFinite(status) && status >= 400 && status <= 599) return status
  return 500
}

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from(CONTACTS_TABLE)
    .select('id,phone,email,address,working_hours,messenger_telegram,messenger_whatsapp')
    .eq('id', 1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return res.status(404).json({ error: 'Not found' })
    return res.status(supabaseErrorStatus(error)).json({ error: error.message, code: error.code })
  }

  res.json(data)
})

router.put('/', async (req, res) => {
  const body = req.body || {}
  const phone = body.phone ?? null
  const email = body.email ?? null
  const address = body.address ?? null
  const working_hours = body.working_hours ?? body.hours?.mon_fri ?? null
  const messenger_telegram = body.messenger_telegram ?? body.telegram ?? null
  const messenger_whatsapp = body.messenger_whatsapp ?? body.whatsapp ?? null

  const { data, error } = await supabase
    .from(CONTACTS_TABLE)
    .upsert(
      [{ id: 1, phone, email, address, working_hours, messenger_telegram, messenger_whatsapp }],
      { onConflict: 'id' }
    )
    .select('id,phone,email,address,working_hours,messenger_telegram,messenger_whatsapp')
    .single()

  if (error) return res.status(supabaseErrorStatus(error)).json({ error: error.message, code: error.code })
  res.json(data)
})

export default router
