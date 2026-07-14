import { useState } from 'react'
import { API_URL, api } from '../api/client'

const starterQuestion = { prompt: '', type: 'text', options: '', marks: 5, correctAnswer: '' }

function TeacherDashboard({ exams, submissions, results, onReload, onMessage }) {
  const [evaluationDraft, setEvaluationDraft] = useState({})
  const [form, setForm] = useState({
    title: 'Fast Scenario Exam',
    subject: 'Science',
    className: 'Class 8',
    durationMinutes: 2,
    passingMarks: 6,
    instructions: 'Timer is strict. Submit before it reaches zero.',
    status: 'published',
    questions: [
      { prompt: 'Explain evaporation.', type: 'text', options: '', marks: 5, correctAnswer: '' },
      { prompt: 'Water freezes at?', type: 'mcq', options: '0 C, 10 C, 50 C, 100 C', marks: 5, correctAnswer: '0 C' },
    ],
  })

  function updateQuestion(index, key, value) {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [key]: value } : question,
      ),
    }))
  }

  async function saveExam(event) {
    event.preventDefault()
    const questions = form.questions.map((question) => ({
      ...question,
      marks: Number(question.marks || 0),
      options:
        question.type === 'mcq'
          ? question.options.split(',').map((option) => option.trim()).filter(Boolean)
          : [],
    }))
    await api.post('/api/exams', {
      ...form,
      totalMarks: questions.reduce((sum, question) => sum + question.marks, 0),
      questions,
    })
    onMessage('Exam created for students.')
    await onReload()
  }

  async function deleteExam(id) {
    await api.delete(`/api/exams/${id}`)
    onMessage('Exam deleted.')
    await onReload()
  }

  async function publishEvaluation(submission) {
    if (submission.resultPublished) {
      onMessage('This result is already published and cannot be published again.')
      return
    }

    const confirmed = window.confirm(
      'Publish this result now? After publishing, it will be visible to the student and cannot be published again.',
    )

    if (!confirmed) {
      return
    }

    const evaluations = submission.answers.map((answer) => ({
      answerId: answer._id,
      points: Number(evaluationDraft[answer._id]?.points ?? answer.points ?? 0),
      remarks: evaluationDraft[answer._id]?.remarks || answer.remarks || '',
    }))

    await api.post('/api/evaluation/evaluate', {
      submissionId: submission._id,
      evaluations,
      publish: true,
      teacherRemarks: evaluationDraft[submission._id]?.teacherRemarks || '',
    })
    onMessage('Evaluation published to student result dashboard.')
    await onReload()
  }

  return (
    <section className="dashboard teacher-theme">
      <div className="stats-row">
        <Stat label="My Exams" value={exams.length} />
        <Stat label="Submissions" value={submissions.length} />
        <Stat label="Published Results" value={results.length} />
      </div>

      <div className="split">
        <form className="panel elevated" onSubmit={saveExam}>
          <div className="panel-head">
            <h2>Teacher Dashboard</h2>
            <button>Create Exam</button>
          </div>
          <div className="two-col">
            <Field label="Exam Name" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
            <Field label="Subject" value={form.subject} onChange={(value) => setForm({ ...form, subject: value })} />
            <Field label="Class" value={form.className} onChange={(value) => setForm({ ...form, className: value })} />
            <Field label="Duration Minutes" type="number" value={form.durationMinutes} onChange={(value) => setForm({ ...form, durationMinutes: value })} />
            <Field label="Passing Marks" type="number" value={form.passingMarks} onChange={(value) => setForm({ ...form, passingMarks: value })} />
            <label>
              Publish Status
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </label>
          </div>
          <label>
            Instructions
            <textarea rows="3" value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} />
          </label>
          <div className="panel-head compact">
            <h3>Questions & Marks</h3>
            <button type="button" className="secondary" onClick={() => setForm({ ...form, questions: [...form.questions, starterQuestion] })}>
              Add Question
            </button>
          </div>
          {form.questions.map((question, index) => (
            <fieldset key={index}>
              <div className="two-col">
                <label>
                  Type
                  <select value={question.type} onChange={(event) => updateQuestion(index, 'type', event.target.value)}>
                    <option value="text">Text/Image</option>
                    <option value="mcq">MCQ</option>
                  </select>
                </label>
                <Field label="Marks" type="number" value={question.marks} onChange={(value) => updateQuestion(index, 'marks', value)} />
              </div>
              <Field label="Question" value={question.prompt} onChange={(value) => updateQuestion(index, 'prompt', value)} />
              {question.type === 'mcq' ? (
                <div className="two-col">
                  <Field label="Options comma separated" value={question.options} onChange={(value) => updateQuestion(index, 'options', value)} />
                  <Field label="Correct Answer" value={question.correctAnswer} onChange={(value) => updateQuestion(index, 'correctAnswer', value)} />
                </div>
              ) : null}
            </fieldset>
          ))}
        </form>

        <section className="panel elevated">
          <h2>Exam Catalog</h2>
          <div className="exam-list">
            {exams.map((exam) => (
              <article className="exam-card" key={exam._id}>
                <div>
                  <strong>{exam.title}</strong>
                  <p>{exam.subject} / {exam.className} / {exam.durationMinutes} min</p>
                </div>
                <span>{exam.status}</span>
                <button type="button" className="danger" onClick={() => deleteExam(exam._id)}>Delete</button>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="panel elevated">
        <div className="panel-head">
          <h2>Timed Evaluation Queue</h2>
          <p className="muted">Default limit: 1440 minutes after submission. Change `EVALUATION_LIMIT_MINUTES` to test expiry.</p>
        </div>
        <div className="submission-grid">
          {submissions.map((submission) => (
            <article className="submission-card" key={submission._id}>
              <div className="panel-head compact">
                <div>
                  <strong>{submission.examId?.title}</strong>
                  <p>{submission.studentId?.name} / due {submission.evaluationDueAt ? new Date(submission.evaluationDueAt).toLocaleString() : 'not submitted'}</p>
                </div>
                <button
                  type="button"
                  className={submission.resultPublished ? 'published-button' : ''}
                  disabled={submission.resultPublished}
                  onClick={() => publishEvaluation(submission)}
                >
                  {submission.resultPublished ? 'Published' : 'Publish Result'}
                </button>
              </div>
              {submission.answers.map((answer) => (
                <div className="answer-row" key={answer._id}>
                  <strong>{answer.questionId?.prompt}</strong>
                  <blockquote>{answer.responseText || answer.responseOption || 'Image answer'}</blockquote>
                  {(answer.imageUrls || []).map((url) => (
                    <a href={`${API_URL}${url}`} target="_blank" key={url}>Open uploaded answer</a>
                  ))}
                  <div className="two-col">
                    <Field label={`Marks / ${answer.questionId?.marks || 0}`} type="number" defaultValue={answer.points || 0} onChange={(value) => setEvaluationDraft({ ...evaluationDraft, [answer._id]: { ...evaluationDraft[answer._id], points: value } })} />
                    <Field label="Remarks" defaultValue={answer.remarks || ''} onChange={(value) => setEvaluationDraft({ ...evaluationDraft, [answer._id]: { ...evaluationDraft[answer._id], remarks: value } })} />
                  </div>
                </div>
              ))}
              <Field label="Final Teacher Remarks" defaultValue={submission.teacherRemarks || ''} onChange={(value) => setEvaluationDraft({ ...evaluationDraft, [submission._id]: { teacherRemarks: value } })} />
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

function Field({ label, onChange, ...props }) {
  return (
    <label>
      {label}
      <input {...props} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function Stat({ label, value }) {
  return (
    <article className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  )
}

export default TeacherDashboard
