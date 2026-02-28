import { randomUUID } from 'crypto'
import { MongoClient } from 'mongodb'

const SALARY = 70000
const COLLECTION_NAME = process.env.MONGODB_COLLECTION || 'expenses'
const TTL_DAYS = Number(process.env.EXPENSE_TTL_DAYS || 0)

let cachedClient = null
let cachedCollection = null
let indexesReady = false

function getRequiredEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

async function getCollection() {
  if (cachedCollection) return cachedCollection

  const uri = getRequiredEnv('MONGODB_URI')
  const dbName = getRequiredEnv('MONGODB_DB')

  if (!cachedClient) {
    cachedClient = new MongoClient(uri)
    await cachedClient.connect()
  }

  cachedCollection = cachedClient.db(dbName).collection(COLLECTION_NAME)

  if (!indexesReady) {
    await cachedCollection.createIndex({ id: 1 }, { unique: true })

    if (TTL_DAYS > 0) {
      await cachedCollection.createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: Math.floor(TTL_DAYS * 24 * 60 * 60) },
      )
    }

    indexesReady = true
  }

  return cachedCollection
}

function normalizeExpense(expense) {
  return {
    id: expense.id,
    title: expense.title,
    amount: Number(expense.amount),
    date: expense.date,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  }
}

export async function readData() {
  const collection = await getCollection()
  const expenses = await collection
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .toArray()

  return {
    salary: SALARY,
    expenses: expenses.map(normalizeExpense),
    updatedAt: expenses.length > 0 ? expenses[0].updatedAt ?? null : null,
  }
}

export async function addExpense({ title, amount, date }) {
  const collection = await getCollection()
  const now = new Date()

  const expense = {
    id: randomUUID(),
    title: String(title).trim(),
    amount: Number(amount),
    date: String(date),
    createdAt: now,
    updatedAt: now,
  }

  await collection.insertOne(expense)
  return normalizeExpense(expense)
}

export async function deleteExpenseById(id) {
  const collection = await getCollection()
  const result = await collection.deleteOne({ id: String(id) })
  return result.deletedCount > 0
}

export async function clearAllExpenses() {
  const collection = await getCollection()
  await collection.deleteMany({})
}

