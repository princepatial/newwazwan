import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faMapMarkerAlt, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <h2>Wazwan Legacy</h2>
          <p>Culinary Excellence Since 1995</p>
        </div>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/menu">Reservations</Link>
          <Link to="#">Contact</Link>
        </div>
        <div className="footer-social">
          <a href="#" aria-label="Facebook"><FontAwesomeIcon icon={faFacebook} /></a>
          <a href="#" aria-label="Instagram"><FontAwesomeIcon icon={faInstagram} /></a>
          <a href="#" aria-label="Twitter"><FontAwesomeIcon icon={faTwitter} /></a>
        </div>
      </div>
      <div className="footer-info">
        <div className="info-item">
          <FontAwesomeIcon icon={faMapMarkerAlt} />
          <span>123 Gourmet Street, Foodville, FC 12345</span>
        </div>
        <div className="info-item">
          <FontAwesomeIcon icon={faPhone} />
          <span>(123) 456-7890</span>
        </div>
        <div className="info-item">
          <FontAwesomeIcon icon={faEnvelope} />
          <span>info@wazwanlegacy.com</span>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Wazwan Legacy. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
