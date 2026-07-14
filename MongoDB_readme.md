## Why MongoDB Over PostgreSQL

I selected MongoDB for this assessment because the Online Examination and Evaluation module has flexible and semi-structured data. A student answer can contain different formats depending on the question: plain text, MCQ option, uploaded handwritten image URLs, teacher remarks, marks, and evaluation metadata. MongoDB handles this type of evolving document structure naturally.

In this system, exams contain multiple questions, submissions contain multiple answers, and answers may have optional fields such as `responseText`, `responseOption`, `imageUrls`, `points`, and `remarks`. Using MongoDB allowed faster development without designing many join tables for every answer type.

### Entities Stored in MongoDB

- Users: teacher and student accounts
- Exams: title, subject, class, duration, status, passing marks, instructions
- Questions: prompt, type, options, marks, correct answer
- Submissions: student attempt, start time, expiry time, evaluation deadline, total score, result status
- Answers: text answers, MCQ responses, uploaded image URLs, marks, remarks

### Advantages of MongoDB

- Flexible schema for different answer formats
- Easy to evolve as new question types are added
- Natural fit for nested exam/submission data
- Faster iteration for assessment development
- Good support through Mongoose models and validation

### Trade-offs

PostgreSQL would provide stronger relational constraints, complex reporting, and transactional guarantees. It would be a good choice for highly structured ERP modules such as fees, attendance, staff payroll, or timetable management.

However, for this examination module, answer data is flexible and can vary from submission to submission. MongoDB reduces complexity while still allowing references between users, exams, questions, submissions, and answers.

### Scalability and Future Enhancements

The current MongoDB design can scale by indexing frequently queried fields such as `teacherId`, `studentId`, `examId`, `status`, and `resultPublished`. Uploaded files can later be moved from local disk storage to cloud storage such as AWS S3 or Cloudinary.

In a larger production ERP, I would consider a hybrid architecture: PostgreSQL for strict relational school records and MongoDB for flexible exam submissions, answer sheets, evaluation metadata, and AI-assisted evaluation logs.
