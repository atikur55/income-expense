import { deleteExpenseById } from '../_lib/expenseStore.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed.' })
  }

  try {
    const { id } = req.query
    await deleteExpenseById(id)
    return res.status(200).json({ success: true })
  } catch {
    return res.status(500).json({ message: 'Failed to delete expense.' })
  }
}
