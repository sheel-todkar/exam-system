const express = require('express');
const { evaluateExam, getResults } = require('../controllers/evaluationController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.post('/evaluate', requireRole('teacher'), evaluateExam);
router.get('/results', getResults);

module.exports = router;

