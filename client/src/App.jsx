import { useState } from 'react'
import { api, setAuthToken } from './api/client'
import AuthPanel from './components/AuthPanel'
import StudentDashboard from './components/StudentDashboard'
import TeacherDashboard from './components/TeacherDashboard'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [exams, setExams] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [results, setResults] = useState([])
  const [message, setMessage] = useState('')

  async function loadData(activeUser = user) {
    if (!activeUser) return

    const [examResponse, submissionResponse, resultResponse] = await Promise.all([
      api.get('/api/exams'),
      api.get('/api/submissions'),
      api.get('/api/evaluation/results'),
    ])

    setExams(examResponse.data)
    setSubmissions(submissionResponse.data)
    setResults(resultResponse.data)
  }

  async function handleAuth(mode, authForm) {
    try {
      const response = await api.post(`/api/auth/${mode}`, authForm)
      setAuthToken(response.data.token)
      setUser(response.data.user)
      setMessage(`Welcome ${response.data.user.name}.`)
      await loadData(response.data.user)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Authentication failed')
    }
  }

  function logout() {
    setAuthToken(null)
    setUser(null)
    setExams([])
    setSubmissions([])
    setResults([])
    setMessage('Logged out.')
  }

  return (
    <main className="app-shell">
      <header className="hero-bar">
        <div>
          <p className="eyebrow">Secure School ERP</p>
          <h1>Online Examination & Evaluation</h1>
          <p className="hero-copy">
            Role-based dashboards, timed exams, timed evaluation, image answers,
            and published results.
          </p>
        </div>
        {user ? (
          <div className="session-card">
            <strong>{user.name}</strong>
            <span>{user.role}</span>
            <button type="button" className="secondary" onClick={logout}>
              Logout
            </button>
          </div>
        ) : null}
      </header>

      {message ? <div className="notice">{message}</div> : null}

      {!user ? (
        <AuthPanel onAuth={handleAuth} />
      ) : user.role === 'teacher' ? (
        <TeacherDashboard
          exams={exams}
          submissions={submissions}
          results={results}
          onReload={() => loadData(user)}
          onMessage={setMessage}
        />
      ) : (
        <StudentDashboard
          exams={exams}
          results={results}
          submissions={submissions}
          user={user}
          onReload={() => loadData(user)}
          onMessage={setMessage}
        />
      )}
    </main>
  )
}

export default App
