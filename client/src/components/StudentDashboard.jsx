import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'

function StudentDashboard({ exams, results, submissions, onReload, onMessage }) {
  const [selectedExamId, setSelectedExamId] = useState('')
  const [activeSubmission, setActiveSubmission] = useState(null)
  const [answers, setAnswers] = useState({})
  const [images, setImages] = useState({})
  const [now, setNow] = useState(() => Date.now())

  const selectedExam = useMemo(
    () => exams.find((exam) => exam._id === selectedExamId) || exams[0],
    [exams, selectedExamId],
  )
  const remainingMs = activeSubmission?.expiresAt
    ? Math.max(0, new Date(activeSubmission.expiresAt).getTime() - now)
    : 0

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  async function startExam(exam) {
    setSelectedExamId(exam._id)
    const response = await api.post('/api/submissions/start', { examId: exam._id })
    setActiveSubmission(response.data.submission)
    setAnswers({})
    setImages({})
    onMessage(`Exam timer started. Ends at ${new Date(response.data.submission.expiresAt).toLocaleTimeString()}.`)
  }

  async function submitExam(event) {
    event.preventDefault()
    if (!selectedExam || !activeSubmission) {
      onMessage('Start the exam before submitting.')
      return
    }
    if (remainingMs <= 0) {
      onMessage('Time is over. Backend will reject late submission.')
      return
    }

    const formData = new FormData()
    formData.append('examId', selectedExam._id)
    formData.append('submissionId', activeSubmission._id)
    formData.append(
      'answers',
      JSON.stringify(
        selectedExam.questions.map((question) => ({
          questionId: question._id,
          responseText: answers[question._id] || '',
          responseOption: answers[question._id] || '',
        })),
      ),
    )
    Object.values(images).forEach((file) => {
      if (file) formData.append('images', file)
    })

    await api.post('/api/submissions', formData)
    setActiveSubmission(null)
    setAnswers({})
    setImages({})
    onMessage('Submitted successfully. Wait for teacher evaluation.')
    await onReload()
  }

  return (
    <section className="dashboard student-theme">
      <div className="stats-row">
        <Stat label="Available Exams" value={exams.length} />
        <Stat label="My Attempts" value={submissions.length} />
        <Stat label="Results" value={results.length} />
      </div>

      <div className="split">
        <section className="panel elevated">
          <div className="panel-head">
            <h2>Student Dashboard</h2>
            <span className={remainingMs > 0 ? 'timer-pill' : 'timer-pill danger-pill'}>
              {activeSubmission ? formatTime(remainingMs) : 'Not started'}
            </span>
          </div>
          <div className="exam-list">
            {exams.map((exam) => (
              <article
                className={selectedExam?._id === exam._id ? 'exam-card active' : 'exam-card'}
                key={exam._id}
                onClick={() => setSelectedExamId(exam._id)}
              >
                <button type="button" className="link-button" onClick={() => setSelectedExamId(exam._id)}>
                  {exam.title}
                </button>
                <p>{exam.subject} / {exam.className} / {exam.durationMinutes} min</p>
                <span>{exam.totalMarks} marks</span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    startExam(exam)
                  }}
                >
                  Start
                </button>
              </article>
            ))}
            {!exams.length ? <p className="empty">No published exams available.</p> : null}
          </div>
        </section>

        <form className="panel elevated" onSubmit={submitExam}>
          <div className="panel-head">
            <div>
              <h2>{selectedExam?.title || 'Select an exam'}</h2>
              <p className="muted">{selectedExam?.instructions}</p>
            </div>
            <button disabled={!activeSubmission || remainingMs <= 0}>Submit</button>
          </div>
          {selectedExam?.questions.map((question) => (
            <fieldset key={question._id} disabled={!activeSubmission || remainingMs <= 0}>
              <legend>{question.marks} marks</legend>
              <h3>{question.prompt}</h3>
              {question.type === 'mcq' ? (
                <div className="option-list">
                  {question.options.map((option) => (
                    <label className="radio-row" key={option}>
                      <input
                        type="radio"
                        name={question._id}
                        checked={answers[question._id] === option}
                        onChange={() => setAnswers({ ...answers, [question._id]: option })}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              ) : (
                <label>
                  Text Answer
                  <textarea
                    rows="4"
                    value={answers[question._id] || ''}
                    onChange={(event) => setAnswers({ ...answers, [question._id]: event.target.value })}
                  />
                </label>
              )}
              <label>
                Upload handwritten answer
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImages({ ...images, [question._id]: event.target.files?.[0] })}
                />
              </label>
            </fieldset>
          ))}
        </form>
      </div>

      <section className="panel elevated">
        <h2>Published Results</h2>
        <div className="result-grid">
          {results.map((result) => (
            <article className="result-card" key={result._id}>
              <strong>{result.examId?.title}</strong>
              <span>{result.percentage}% / Grade {result.grade} / {result.passed ? 'Pass' : 'Fail'}</span>
              <p>Score: {result.score}</p>
              <p className="muted">{result.teacherRemarks || 'No final remarks.'}</p>
            </article>
          ))}
          {!results.length ? <p className="empty">No published result yet.</p> : null}
        </div>
      </section>
    </section>
  )
}

function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

function Stat({ label, value }) {
  return (
    <article className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  )
}

export default StudentDashboard
