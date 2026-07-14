const express = require('express');
const { createExam, deleteExam, listExams, updateExam } = require('../controllers/examController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.post('/', requireRole('teacher'), createExam);
router.get('/', listExams);
router.put('/:id', requireRole('teacher'), updateExam);
router.delete('/:id', requireRole('teacher'), deleteExam);

module.exports = router;

