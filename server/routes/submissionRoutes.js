const express = require('express');
const { listSubmissions, startSubmission, submitAnswer } = require('../controllers/submissionController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.use(requireAuth);
router.post('/start', requireRole('student'), startSubmission);
router.post('/', requireRole('student'), upload.array('images', 20), submitAnswer);
router.get('/', listSubmissions);

module.exports = router;

