import React, { useState } from 'react';
import { 
  FaStar, 
  FaUtensils, 
  FaConciergeBell, 
  FaSmile, 
  FaMapMarkerAlt, 
  FaQrcode, 
  FaComment,
  FaDownload,
  FaArrowLeft,
  FaTimes
} from 'react-icons/fa';
import axios from 'axios';
import './Feedback.css';

const RestaurantFeedback = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [feedbackType, setFeedbackType] = useState(null);
  const [ratings, setRatings] = useState({
    food: 0,
    service: 0,
    ambiance: 0,
    overall: 0,
  });
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState({
    text: '',
    type: '' // 'success' or 'error'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const locations = ['Kharar', 'Mohali', 'Chandigarh'];

  // Updated SVG paths using src/assets
  const locationQRs = {
    Kharar: '/src/assets/kharar.svg',
    Mohali: '/src/assets/kharar.svg',
    Chandigarh: '/src/assets/Chandigrah.svg'
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setFeedbackType('google');
  };

  const handleGoBack = () => {
    // Reset to location selection
    setSelectedLocation(null);
    setFeedbackType(null);
    setMessage({ text: '', type: '' });
  };

  const handleResetLocation = () => {
    // Reset only the location, keeping feedback type
    setSelectedLocation(null);
    setMessage({ text: '', type: '' });
  };

  const renderStars = (category) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={`rf-star-rating ${index < ratings[category] ? 'active' : ''}`}
        onClick={() => setRatings((prev) => ({ ...prev, [category]: index + 1 }))}
      />
    ));
  };

  const handleDownloadQR = () => {
    if (selectedLocation) {
      const link = document.createElement('a');
      link.href = locationQRs[selectedLocation];
      link.download = `${selectedLocation}_QR_Code.svg`;
      link.click();
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    

    axios.defaults.baseURL = 'http://localhost:5000';
    
    try {
      const response = await axios.post('/feedback', {
        location: selectedLocation,
        ratings: ratings,
        comment: comment,
        feedbackType: feedbackType
      });
      
      setMessage({
        text: 'Feedback submitted successfully!',
        type: 'success'
      });
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 2000);
  
  
      // Reset form
      setRatings({
        food: 0,
        service: 0,
        ambiance: 0,
        overall: 0,
      });
      setComment('');
    } catch (error) {
      setMessage({
        text: 'Failed to submit feedback',
        type: 'error'
      });
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 2000);
    }
  };

  return (
    <div className="rf-feedback-wrapper">
      <div className="rf-feedback-container">
        {selectedLocation && (
          <div className="rf-navigation-buttons">
            <button 
              className="rf-back-button" 
              onClick={handleGoBack}
            >
              <FaArrowLeft /> Back to Locations
            </button>
            <button 
              className="rf-reset-location-button" 
              onClick={handleResetLocation}
            >
              <FaTimes /> Change Location
            </button>
          </div>
        )}

        <div className="rf-feedback-header">
          <h1>Restaurant Feedback</h1>
          <p>Your opinion helps us improve</p>
        </div>

        {message.text && (
          <div 
            className={`rf-message ${message.type === 'success' ? 'rf-success' : 'rf-error'}`}
          >
            {message.text}
          </div>
        )}

        {!selectedLocation ? (
          <div className="rf-location-selection">
            <h2>Choose Your Location</h2>
            <div className="rf-location-grid">
              {locations.map((location) => (
                <div 
                  key={location} 
                  className="rf-location-card"
                  onClick={() => handleLocationSelect(location)}
                >
                  <FaMapMarkerAlt className="rf-location-icon" /> <br />
                  <span>{location}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rf-feedback-content">
            <h2>{selectedLocation} Restaurant</h2>

            <div className="rf-feedback-toggle">
              <button 
                className={`rf-toggle-btn ${feedbackType === 'google' ? 'active' : ''}`}
                onClick={() => setFeedbackType('google')}
              >
                <FaQrcode /> Google Review
              </button>
              <button 
                className={`rf-toggle-btn ${feedbackType === 'experience' ? 'active' : ''}`}
                onClick={() => setFeedbackType('experience')}
              >
                <FaComment /> Share Experience
              </button>
            </div>

            {feedbackType === 'google' && (
              <div className="rf-qr-section">
                <div className="rf-qr-container">
                  <img 
                    src={locationQRs[selectedLocation]} 
                    alt={`${selectedLocation} QR Code`} 
                    className="rf-qr-image"
                  />
                  <button 
                    className="rf-download-qr-btn"
                    onClick={handleDownloadQR}
                  >
                    <FaDownload /> Download QR
                  </button>
                </div>
                <p>Scan or download this QR code to leave a Google Review</p>
              </div>
            )}

            {feedbackType === 'experience' && (
              <form 
                className="rf-experience-form"
                onSubmit={handleSubmitFeedback}
              >
                <div className="rf-rating-grid">
                  <div className="rf-rating-item">
                    <label><FaUtensils /> Food Quality</label>
                    <div className="rf-star-container">{renderStars('food')}</div>
                  </div>
                  <div className="rf-rating-item">
                    <label><FaConciergeBell /> Service</label>
                    <div className="rf-star-container">{renderStars('service')}</div>
                  </div>
                  <div className="rf-rating-item">
                    <label><FaSmile /> Ambiance</label>
                    <div className="rf-star-container">{renderStars('ambiance')}</div>
                  </div>
                  <div className="rf-rating-item">
                    <label>Overall Experience</label>
                    <div className="rf-star-container">{renderStars('overall')}</div>
                  </div>
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share the details of your experience..."
                  required
                />

                <button 
                  type="submit" 
                  className="rf-submit-feedback-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantFeedback;