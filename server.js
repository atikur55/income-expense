import cors from 'cors'
import express from 'express'
import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const PORT = process.env.PORT || 4000
const SALARY = 70000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_FILE = path.join(__dirname, 'data', 'expenses.json')

app.use(cors())
app.use(express.json())

async function ensureDataFile() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  try {
    await fs.access(DATA_FILE)
  } catch {
    const initialData = { salary: SALARY, expenses: [], updatedAt: null }
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8')
  }
}

async function readData() {
  const raw = await fs.readFile(DATA_FILE, 'utf-8')
  const parsed = JSON.parse(raw)
  return {
    salary: SALARY,
    expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
    updatedAt: parsed.updatedAt ?? null,
  }
}

async function writeData(expenses) {
  const payload = {
    salary: SALARY,
    expenses,
    updatedAt: new Date().toISOString(),
  }
  await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8')
  return payload
}

app.get('/api/expenses', async (_req, res) => {
  try {
    const data = await readData()
    res.json(data)
  } catch {
    res.status(500).json({ message: 'Failed to read JSON data.' })
  }
})

app.post('/api/expenses', async (req, res) => {
  try {
    const { title, amount, date } = req.body
    const amountNum = Number(amount)

    if (!title || !date || !amountNum || amountNum <= 0) {
      return res.status(400).json({ message: 'Invalid payload.' })
    }

    const data = await readData()
    const newExpense = {
      id: randomUUID(),
      title: String(title).trim(),
      amount: amountNum,
      date: String(date),
    }

    const updatedExpenses = [newExpense, ...data.expenses]
    await writeData(updatedExpenses)
    return res.status(201).json(newExpense)
  } catch {
    return res.status(500).json({ message: 'Failed to save expense.' })
  }
})

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const data = await readData()
    const updatedExpenses = data.expenses.filter((item) => item.id !== req.params.id)
    await writeData(updatedExpenses)
    res.json({ success: true })
  } catch {
    res.status(500).json({ message: 'Failed to delete expense.' })
  }
})

app.delete('/api/expenses', async (_req, res) => {
  try {
    await writeData([])
    res.json({ success: true })
  } catch {
    res.status(500).json({ message: 'Failed to clear all data.' })
  }
})

ensureDataFile().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
})
