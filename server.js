import express from 'express'
import { MongoClient, ObjectId } from 'mongodb'  
import dotenv from 'dotenv'
dotenv.config()
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'

const app = express()
const port = process.env.PORT || 5000

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
const isProduction = process.env.NODE_ENV === 'production'

app.use(cors({
  origin: corsOrigin,
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

const url = process.env.MONGO_URI
if (!url) {
  console.error('Missing MONGO_URI in environment variables')
  process.exit(1)
}

const client = new MongoClient(url)
const dbName = "project"
const jwtSecret = process.env.JWT_SECRET
const tokenExpiry = '7d'
const cookieMaxAgeMs = 7 * 24 * 60 * 60 * 1000

const createToken = (user) => {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email, name: user.name },
    jwtSecret,
    { expiresIn: tokenExpiry }
  )
}

const setAuthCookie = (res, token) => {
  res.cookie('auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: cookieMaxAgeMs
  })
}

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || ''
  const bearerToken = header.startsWith('Bearer ') ? header.slice(7) : null
  const cookieToken = req.cookies?.auth_token
  const token = cookieToken || bearerToken

  if (!token) {
    return res.status(401).json({ error: 'Missing auth token' })
  }

  try {
    req.user = jwt.verify(token, jwtSecret)
    return next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

async function startServer() {
  try {
    if (!jwtSecret) {
      console.error('Missing JWT_SECRET in environment')
      process.exit(1)
    }

    console.log("Trying to connect to Mongo...")
    await client.connect()
    console.log("MongoDB connected successfully")

    app.post('/auth/register', async (req, res) => {
      try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
          return res.status(400).json({ error: 'Name, email, and password are required' })
        }

        if (password.length < 6) {
          return res.status(400).json({ error: 'Password must be at least 6 characters' })
        }

        const db = client.db(dbName)
        const users = db.collection('users')
        const normalizedEmail = email.trim().toLowerCase()

        const existingUser = await users.findOne({ email: normalizedEmail })
        if (existingUser) {
          return res.status(409).json({ error: 'Email already registered' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const result = await users.insertOne({
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          createdAt: new Date()
        })

        const user = { _id: result.insertedId, name: name.trim(), email: normalizedEmail }
        const token = createToken(user)
        setAuthCookie(res, token)

        return res.status(201).json({
          user: { id: user._id.toString(), name: user.name, email: user.email }
        })
      } catch (error) {
        return res.status(500).json({ error: error.message })
      }
    })

    app.post('/auth/login', async (req, res) => {
      try {
        const { email, password } = req.body

        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required' })
        }

        const db = client.db(dbName)
        const users = db.collection('users')
        const normalizedEmail = email.trim().toLowerCase()

        const user = await users.findOne({ email: normalizedEmail })
        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' })
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid credentials' })
        }

        const token = createToken(user)
        setAuthCookie(res, token)
        return res.json({
          user: { id: user._id.toString(), name: user.name, email: user.email }
        })
      } catch (error) {
        return res.status(500).json({ error: error.message })
      }
    })

    app.get('/auth/me', authMiddleware, async (req, res) => {
      try {
        const db = client.db(dbName)
        const users = db.collection('users')
        const userId = req.user.userId
        const user = await users.findOne({ _id: new ObjectId(userId) })

        if (!user) {
          return res.status(404).json({ error: 'User not found' })
        }

        return res.json({
          user: { id: user._id.toString(), name: user.name, email: user.email }
        })
      } catch (error) {
        return res.status(500).json({ error: error.message })
      }
    })

    app.post('/auth/logout', (req, res) => {
      res.clearCookie('auth_token')
      return res.json({ success: true })
    })

    // get api to get all the passwords from the database
    app.get('/', authMiddleware, async (req, res) => {
      const db = client.db(dbName)
      const collection = db.collection('documents')
      const result = await collection.find({ userId: req.user.userId }).toArray() // get passwords created by current user only
      res.json(result)
    })

    // post api to send results into the database
    app.post('/', authMiddleware, async (req, res) => {
      try {
        const db = client.db(dbName)
        const collection = db.collection('documents')
        const result = await collection.insertOne({
          ...req.body,
          userId: req.user.userId
        })
        res.json({ success: true, insertedId: result.insertedId })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    // delete all api - move this BEFORE /:id route
    app.delete('/delAll', authMiddleware, async (req, res) => {
      try {
        const db = client.db(dbName)
        const collection = db.collection('documents')
        const result = await collection.deleteMany({ userId: req.user.userId })
        res.json({ success: true, deletedCount: result.deletedCount })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    // delete api to delete a password from the database - keep this AFTER /delAll
    app.delete('/:id', authMiddleware, async (req, res) => {
      try {
        const db = client.db(dbName)
        const collection = db.collection('documents')
        const result = await collection.deleteOne({
          id: req.params.id,
          userId: req.user.userId
        })
        res.json(result)
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    app.listen(port, () => {
      console.log(`listening on port http://localhost:${port}`)
    })

  } catch (error) {
    console.error(error)
  }
}

startServer()
