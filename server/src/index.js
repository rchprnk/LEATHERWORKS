import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import portfolioRouter from './routes/portfolio.js'
import contactRouter from './routes/contact.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5002

app.use(cors({ origin: 'http://localhost:5175' }))
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/portfolio', portfolioRouter)
app.use('/api/contact', contactRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})