const express = require('express');
const router = express.Router();
const { submitFeedback, getAllFeedback } = require('../Controller/feedbackController');

router.post('/', submitFeedback);
router.get('/', getAllFeedback);

module.exports = router;
