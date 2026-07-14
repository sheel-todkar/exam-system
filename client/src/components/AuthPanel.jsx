import { useState } from 'react'

const presets = {
  teacher: {
    name: 'Anita Teacher',
    email: 'teacher@test.com',
    password: 'password123',
    role: 'teacher',
  },
  student: {
    name: 'Ravi Student',
    email: 'student@test.com',
    password: 'password123',
    role: 'student',
  },
}

function AuthPanel({ onAuth }) {
  const [form, setForm] = useState(presets.teacher)

  return (
    <section className="auth-layout">
      <form className="glass-panel" onSubmit={(event) => event.preventDefault()}>
        <div className="panel-head">
          <div>
            <p className="eyebrow">JWT Authentication</p>
            <h2>Login by role</h2>
          </div>
          <select value={form.role} onChange={(event) => setForm(presets[event.target.value])}>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>
        <label>
          Name
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label>
          Email
          <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </label>
        <div className="actions">
          <button type="button" onClick={() => onAuth('login', form)}>
            Login
          </button>
          <button type="button" className="secondary" onClick={() => onAuth('register', form)}>
            Register
          </button>
        </div>
      </form>
      <aside className="feature-panel">
        <h2>Online exam portal</h2>
        <p>Teachers manage examinations and evaluations. Students attend timed exams and view published results.</p>
        <ul>
          <li>Role-based dashboards</li>
          <li>Timed exam submissions</li>
          <li>Answer sheet uploads</li>
          <li>Question-wise evaluation</li>
        </ul>
      </aside>
    </section>
  )
}

export default AuthPanel
