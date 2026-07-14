# School Exam ERP - Online Examination & Evaluation System

Responsive MERN-style web application for the KodeMelon Full Stack Developer Internship assessment. Teachers can create exams, add questions with marks, publish exams, review submissions, evaluate answers, publish results, and students can answer with text, MCQ selections, and uploaded handwritten answer images.

## Tech Stack

- Frontend: React, Vite, Axios, CSS
- Backend: Node.js, Express.js, Multer
- Auth: Signed JWT Bearer tokens with teacher/student authorization guards
- Database: MongoDB with Mongoose

## Setup

```bash
cd server
npm install
node server.js
```

```bash
cd client
npm install
npm run dev
```

The app runs at `http://127.0.0.1:5173` and the API runs at `http://localhost:5000`.

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/school-exam-erp
UPLOAD_DIR=uploads/answers
JWT_SECRET=change-this-secret
EVALUATION_LIMIT_MINUTES=1440
```

## Folder Structure

```text
client/src/App.jsx          Main responsive UI
client/src/App.css          Application styling
server/server.js            Express app entry
server/models               Mongoose schemas
server/controllers          Business logic
server/routes               REST routes
server/middleware/upload.js Multer image upload
server/uploads/answers      Uploaded answer sheet images
```

## Features

- Teacher and student login/register with JWT
- Separate teacher and student dashboards
- Role-based API authorization
- Teacher exam creation with subject, class, duration, passing marks, instructions, status
- Multiple questions per exam
- Question-wise marks
- Publish/unpublish exam status
- Student examination screen
- Text, MCQ, and handwritten image answer uploads
- Teacher submission review
- Uploaded image preview links
- Question-wise marks and remarks
- Result publishing
- Student result dashboard with total, percentage, grade, pass/fail
- Strict student exam timer enforced by backend
- Teacher evaluation deadline enforced by backend

## Test Data

Seed test data:

```bash
cd server
npm run seed
```

If the global `npm` command is broken on your machine, run:

```bash
node scripts/seed.js
```

Accounts:

| Role | Email | Password | Scenario |
| --- | --- | --- | --- |
| Teacher | `teacher@test.com` | `password123` | Create exams, evaluate submissions, view hidden draft exam |
| Student | `student@test.com` | `password123` | See published exams, take timed exam, view published result |
| Student | `late@test.com` | `password123` | Has a submission whose evaluation deadline is already expired |

Seeded scenarios:

- `Quick Science Test`: 2 minute published exam for strict timer testing.
- `Long Math Practice`: normal published exam with an already published result.
- `Hidden Draft Exam`: teacher-only draft exam, hidden from students.
- Late student submission: teacher evaluation should fail because the evaluation deadline has passed.

## API Documentation

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

Body:

```json
{
  "name": "Demo Teacher",
  "email": "teacher@example.com",
  "password": "password",
  "role": "teacher"
}
```

All protected routes require:

```http
Authorization: Bearer <token>
```

### Exams

- `GET /api/exams`
- `POST /api/exams`
- `PUT /api/exams/:id`
- `DELETE /api/exams/:id`

Teacher can create/update/delete. Students only receive published exams.

Exam body:

```json
{
  "title": "Unit Test 1",
  "subject": "Science",
  "className": "Class 8",
  "durationMinutes": 60,
  "passingMarks": 10,
  "status": "published",
  "questions": [
    {
      "prompt": "Explain photosynthesis.",
      "type": "text",
      "marks": 5
    }
  ]
}
```

### Submissions

- `GET /api/submissions`
- `POST /api/submissions/start`
- `POST /api/submissions`

Submission uses `multipart/form-data`:

- `examId`
- `submissionId`
- `answers` as JSON string
- `images` as uploaded files

Students must call `/api/submissions/start` first. The backend creates `expiresAt` from the exam duration and rejects late submissions.

### Evaluation and Results

- `POST /api/evaluation/evaluate`
- `GET /api/evaluation/results`
- `GET /api/evaluation/results?studentId=:id`

Evaluation body:

```json
{
  "submissionId": "submission_id",
  "publish": true,
  "teacherRemarks": "Good work",
  "evaluations": [
    {
      "answerId": "answer_id",
      "points": 4,
      "remarks": "Clear answer"
    }
  ]
}
```

The backend rejects evaluation after `evaluationDueAt`. Configure the deadline with `EVALUATION_LIMIT_MINUTES`.

## Database Design

MongoDB was selected because examination submissions can contain mixed answer types: text, MCQ responses, image uploads, remarks, and evolving evaluation metadata. A document database keeps iteration fast and allows flexible answer structures without complex relational joins.

Entities stored in MongoDB:

- Users: teacher and student profiles
- Exams: exam configuration, subject, class, duration, marks, status
- Questions: prompts, type, options, marks, answer key
- Submissions: student exam attempt, score, status, result data
- Answers: text/MCQ/image responses, marks, remarks

Trade-offs:

- MongoDB is flexible and easy to evolve for varied answer formats.
- PostgreSQL would provide stronger relational constraints and reporting guarantees.
- For a production ERP, MongoDB can be retained for submissions while PostgreSQL could be added later for finance, attendance, and strict transactional modules.

## Architecture Decisions

- REST APIs are separated by domain: auth, exams, submissions, evaluation.
- Multer stores uploaded answer images on disk and exposes them through `/uploads`.
- Question-wise evaluation is stored at answer level for detailed result reporting.
- Result publishing is explicit, so students only see finalized results.
- The frontend is a single React app with role-based panels to keep the assessment demo quick and easy to review.

## Assumptions

- Passwords are hashed with Node crypto for demo purposes; production should use bcrypt/argon2.
- JWT is implemented with signed HMAC tokens using Node crypto to avoid adding package-install risk during the assessment.
- One uploaded image can be associated per answered question in the current UI.
- Teachers can view all submissions.

## Future Enhancements

- JWT authentication and role-based middleware
- Pagination, search, and filters
- Rich text editor
- Image zoom/annotation
- Draft submissions
- Docker deployment
- AI-assisted evaluation suggestions
