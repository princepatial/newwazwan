import React, { useState } from 'react';
import axios from 'axios'; // Import axios
import { FaGoogle, FaStar, FaUtensils, FaConciergeBell, FaSmile, FaMapMarkerAlt } from 'react-icons/fa';
import './Feedback.css';

const Feedback = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [feedbackType, setFeedbackType] = useState(null);
  const [ratings, setRatings] = useState({
    food: 0,
    service: 0,
    ambiance: 0,
    overall: 0
  });
  const [comment, setComment] = useState('');

  const locations = ['Kharar', 'Mohali', 'Chandigarh'];

  const googleReviewLinks = {
    Kharar: 'https://www.google.com/search?q=wazwan+legacy#lrd=0x390ffb001a87a99d:0x7d78bd36ffc81752,3,,,,&rlimm=9041184295863457618',
    Mohali: 'https://g.page/r/CY1XhvbX_ZEMEAE/review',
    Chandigarh: 'https://www.google.com/search?q=wazwan+legacy#lrd=0x390fed2614a30275:0x9c9f2355bdb12f01,3,,,,&rlimm=11285778042375450369',
    default: 'https://www.google.com/search?q=wazwan+legacy#lrd=0x390ffb001a87a99d:0x7d78bd36ffc81752,1,,,,'
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleFeedbackTypeChange = (type) => {
    setFeedbackType(type);
  };

  const handleRatingChange = (category, value) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const feedbackData = {
      location: selectedLocation,
      ratings: ratings,
      comment: comment,
    };

    try {
      // Make a POST request to your backend API
      await axios.post('http://localhost:5000/feedback', feedbackData);
      alert('Feedback submitted successfully!');
      // Reset the form
      setSelectedLocation(null);
      setFeedbackType(null);
      setRatings({ food: 0, service: 0, ambiance: 0, overall: 0 });
      setComment('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('There was an error submitting your feedback. Please try again.');
    }
  };

  const navigateToGoogleReview = () => {
    const reviewLink = googleReviewLinks[selectedLocation] || googleReviewLinks.default;
    window.open(reviewLink, '_blank');
  };

  const renderStars = (category) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < ratings[category] ? 'star active' : 'star'}
        onClick={() => handleRatingChange(category, index + 1)}
      />
    ));
  };

  return (
    <div className="feedback-container">
      <h1>Your Opinion Matters</h1>
      {!selectedLocation ? (
        <>
          <p>Please select your restaurant location:</p>
          <div className="location-options">
            {locations.map((location) => (
              <button
                key={location}
                className="location-option"
                onClick={() => handleLocationSelect(location)}
              >
                <FaMapMarkerAlt /> {location}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p>How was your experience at our {selectedLocation} restaurant?</p>
          <div className="feedback-options">
            <button
              className={`feedback-option ${feedbackType === 'google' ? 'active' : ''}`}
              onClick={() => {
                handleFeedbackTypeChange('google');
                navigateToGoogleReview();
              }}
            >
              <FaGoogle /> Rate Us on Google
            </button>
            <button
              className={`feedback-option ${feedbackType === 'experience' ? 'active' : ''}`}
              onClick={() => handleFeedbackTypeChange('experience')}
            >
              <FaSmile /> Share Your Experience
            </button>
          </div>

          {feedbackType === 'experience' && (
            <form onSubmit={handleSubmit} className="experience-form">
              <div className="rating-section">
                <div className="rating-item">
                  <label><FaUtensils /> Food Quality</label>
                  <div className="stars">{renderStars('food')}</div>
                </div>
                <div className="rating-item">
                  <label><FaConciergeBell /> Service</label>
                  <div className="stars">{renderStars('service')}</div>
                </div>
                <div className="rating-item">
                  <label><FaSmile /> Ambiance</label>
                  <div className="stars">{renderStars('ambiance')}</div>
                </div>
                <div className="rating-item">
                  <label>Overall Experience</label>
                  <div className="stars">{renderStars('overall')}</div>
                </div>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="We'd love to hear more about your experience..."
                required
              />

              <button type="submit" className="submit-button">Submit Feedback</button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default Feedback;
