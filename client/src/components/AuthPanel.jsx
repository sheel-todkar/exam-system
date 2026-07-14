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
        <h2>Test fast</h2>
        <p>Register the teacher preset, create or seed exams, logout, then login with the student preset.</p>
        <ul>
          <li>Teacher APIs require teacher JWT.</li>
          <li>Student submissions require student JWT.</li>
          <li>Exam submission locks after the exam timer.</li>
          <li>Evaluation locks after the evaluation deadline.</li>
        </ul>
      </aside>
    </section>
  )
}

export default AuthPanel
