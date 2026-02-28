import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'

const SALARY = 70000
const BUNDLED_DATA_FILE = path.join(process.cwd(), 'data', 'expenses.json')
const TMP_DATA_FILE = '/tmp/expenses.json'

function defaultData() {
  return {
    salary: SALARY,
    expenses: [],
    updatedAt: null,
  }
}

async function readJsonFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf-8')
  const parsed = JSON.parse(raw)
  return {
    salary: SALARY,
    expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
    updatedAt: parsed.updatedAt ?? null,
  }
}

async function writeTmpData(data) {
  await fs.writeFile(TMP_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export async function readData() {
  try {
    return await readJsonFile(TMP_DATA_FILE)
  } catch {
    try {
      return await readJsonFile(BUNDLED_DATA_FILE)
    } catch {
      return defaultData()
    }
  }
}

export async function writeData(expenses) {
  const payload = {
    salary: SALARY,
    expenses,
    updatedAt: new Date().toISOString(),
  }
  await writeTmpData(payload)
  return payload
}

export function makeExpense({ title, amount, date }) {
  return {
    id: randomUUID(),
    title: String(title).trim(),
    amount: Number(amount),
    date: String(date),
  }
}

