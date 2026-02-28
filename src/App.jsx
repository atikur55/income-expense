import { useEffect, useMemo, useState } from 'react'
import './App.css'

const SALARY = 70000
const API_BASE = import.meta.env.VITE_API_BASE || '/api'

function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

function formatBDT(amount) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(amount)
}

function App() {
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState({ title: '', amount: '', date: getTodayDate() })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setError('')
        const response = await fetch(`${API_BASE}/expenses`)
        if (!response.ok) {
          throw new Error('Failed to load data')
        }
        const data = await response.json()
        if (Array.isArray(data.expenses)) {
          setExpenses(data.expenses)
        } else {
          setExpenses([])
        }
      } catch {
        setError('Could not connect to the JSON server. Start backend first.')
      } finally {
        setLoading(false)
      }
    }
    loadExpenses()
  }, [])

  const totalExpense = useMemo(() => {
    return expenses.reduce((sum, item) => sum + Number(item.amount), 0)
  }, [expenses])

  const remaining = SALARY - totalExpense
  const savings = remaining < 0 ? 0 : remaining

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const amount = Number(form.amount)
    if (!form.title.trim() || !amount || amount <= 0 || !form.date) return

    try {
      setError('')
      const response = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          amount,
          date: form.date,
        }),
      })
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Failed to add expense')
      }
      const newExpense = await response.json()
      setExpenses((prev) => [newExpense, ...prev])
      setForm({ title: '', amount: '', date: getTodayDate() })
    } catch {
      setError('Add failed. Backend server is not running or request is invalid.')
    }
  }

  const handleDeleteSingle = async (id) => {
    try {
      setError('')
      const response = await fetch(`${API_BASE}/expenses/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete expense')
      }
      setExpenses((prev) => prev.filter((item) => item.id !== id))
    } catch {
      setError('Delete failed. Please retry.')
    }
  }

  const handleDeleteAll = async () => {
    try {
      setError('')
      const response = await fetch(`${API_BASE}/expenses`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to clear data')
      }
      setExpenses([])
    } catch {
      setError('Delete all failed. Please retry.')
    }
  }

  return (
    <main className="app-shell">
      <section className="card">
        <div className="topbar">
          <div>
            <p className="kicker">Monthly Expense Tracker</p>
            <h1>Income vs Expense</h1>
          </div>
          <button className="danger" type="button" onClick={handleDeleteAll}>
            Delete All Data
          </button>
        </div>

        <div className="summary-grid">
          <article>
            <p>Monthly Salary</p>
            <h2>{formatBDT(SALARY)}</h2>
          </article>
          <article>
            <p>Total Expense</p>
            <h2>{formatBDT(totalExpense)}</h2>
          </article>
          <article>
            <p>Remaining Balance</p>
            <h2 className={remaining < 0 ? 'negative' : 'positive'}>
              {formatBDT(remaining)}
            </h2>
          </article>
          <article>
            <p>Saved Money</p>
            <h2 className="positive">{formatBDT(savings)}</h2>
          </article>
        </div>

        <form className="expense-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Expense title (e.g. Groceries)"
            required
          />
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount"
            min="1"
            required
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
          <button type="submit">Add Expense</button>
        </form>

        <div className="list-wrap">
          {loading ? (
            <p className="empty">Loading data...</p>
          ) : expenses.length === 0 ? (
            <p className="empty">No expense added yet.</p>
          ) : (
            <ul>
              {expenses.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.date}</span>
                  </div>
                  <div className="row-end">
                    <span>{formatBDT(item.amount)}</span>
                    <button
                      className="ghost-danger"
                      type="button"
                      onClick={() => handleDeleteSingle(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {error ? <p className="negative">{error}</p> : null}
        </div>
      </section>
    </main>
  )
}

export default App
