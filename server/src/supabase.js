import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing env SUPABASE_URL')
}

if (!supabaseKey) {
  throw new Error('Missing env SUPABASE_SERVICE_ROLE_KEY (recommended) or SUPABASE_KEY / SUPABASE_ANON_KEY')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
