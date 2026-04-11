import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import portfolioRouter from './routes/portfolio.js'
import contactRouter from './routes/contact.js'
import categoriesRouter from './routes/categories.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env') })

const app = express()
const PORT = process.env.PORT || 5002

const allowedOrigins = (
  process.env.CLIENT_ORIGIN ||
  process.env.CORS_ORIGIN ||
  'http://localhost:5173,http://localhost:5174,http://localhost:5175'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, cb) {
      // Allow non-browser requests (no Origin header) and same-origin calls.
      if (!origin) return cb(null, true)
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true)
      return cb(new Error(`CORS blocked for origin: ${origin}`))
    },
  })
)
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/portfolio', portfolioRouter)
app.use('/api/contact', contactRouter)
app.use('/api/categories', categoriesRouter)

// Basic JSON error handler (multer, thrown errors, etc.)
app.use((err, req, res, next) => {
  if (!err) return next()
  const status = Number(err.status || err.statusCode)
  res.status(Number.isFinite(status) ? status : 500).json({ error: err.message || 'Internal Server Error' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
