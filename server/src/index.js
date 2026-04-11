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

app.use(cors({ origin: 'http://localhost:5175' }))
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
