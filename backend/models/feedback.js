const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
  },
  ratings: {
    food: Number,
    service: Number,
    ambiance: Number,
    overall: Number,
  },
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Feedback', FeedbackSchema,'feedback');
