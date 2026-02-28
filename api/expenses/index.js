import { makeExpense, readData, writeData } from '../_lib/expenseStore.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    try {
      const data = await readData()
      return res.status(200).json(data)
    } catch {
      return res.status(500).json({ message: 'Failed to read JSON data.' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, amount, date } = req.body || {}
      const amountNum = Number(amount)
      if (!title || !date || !amountNum || amountNum <= 0) {
        return res.status(400).json({ message: 'Invalid payload.' })
      }

      const data = await readData()
      const newExpense = makeExpense({ title, amount: amountNum, date })
      await writeData([newExpense, ...data.expenses])
      return res.status(201).json(newExpense)
    } catch {
      return res.status(500).json({ message: 'Failed to save expense.' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await writeData([])
      return res.status(200).json({ success: true })
    } catch {
      return res.status(500).json({ message: 'Failed to clear all data.' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed.' })
}

