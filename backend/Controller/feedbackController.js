const Feedback = require('../models/feedback');

exports.submitFeedback = async (req, res) => {
  try {
    const { location, ratings, comment } = req.body;
    const newFeedback = new Feedback({
      location,
      ratings,
      comment,
    });
    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback: newFeedback });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting feedback', error: error.message });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback', error: error.message });
  }
};
