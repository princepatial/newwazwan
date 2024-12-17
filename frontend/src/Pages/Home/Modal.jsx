import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Modal.css';

const Modal = ({ onClose }) => {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleNewCustomerClick = () => {
    navigate('/new-customer');
  };

  const handleRegularCustomerClick = () => {
    navigate('/regular-customer');
  };

  const messages = [
    'Discover our curated menu',
    'Experience culinary excellence',
    'Indulge in refined flavors',
    'Savor the art of dining',
    'Elevate your palate',
  ];

  useEffect(() => {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage);
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <span className="sr-only">Close</span>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
        <h2 id="welcome">Welcome</h2>
        <p className="subtitle">{message}</p>
        <div className="modal-options">
          <div className="option">
            <h3>New Guest</h3>
            <p>Begin your culinary journey with us</p>
            <button onClick={handleNewCustomerClick}>Explore Menu</button>
          </div>
          <div className="vertical-line"></div>
          <div className="option">
            <h3>Returning Guest</h3>
            <p>Welcome back to familiar flavors</p>
            <button onClick={handleRegularCustomerClick}>View Favorites</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
