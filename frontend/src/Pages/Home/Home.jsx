import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import Modal from './Modal';

const Home = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleFeedbackClick = () => {
    navigate('/feedback');
  };

  const luxuryDishes = [
    { name: 'Rogan Josh', description: 'Aromatic lamb curry infused with Kashmiri spices' },
    { name: 'Gushtaba', description: 'Velvety meatballs simmered in a rich yogurt sauce' },
    { name: 'Dum Aloo', description: 'Baby potatoes cooked in a fragrant, spiced gravy' },
    { name: 'Yakhni', description: 'Delicate lamb curry with a aromatic yogurt-based broth' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % luxuryDishes.length);
    }, 5000);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);




  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };






  return (
    <div className="luxury-wazwan-home">
      <nav className={`lwh-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="lwh-logo"></div>
        <ul className="lwh-menu">
          <li><a href="#experience">Experience</a></li>
          <li><a href="#dishes">Dishes</a></li>
          <li><a href="#ambiance">Ambiance</a></li>
          <li><a href="#reservation">Reserve</a></li>
        </ul>
      </nav>

      <header className="lwh-hero">
        <div className="lwh-hero-content">
          <h1 className="lwh-title">Wazwan Legacy</h1>
          <p className="lwh-subtitle">Experience the Royal Flavors of Kashmir</p>
          <button className="lwh-cta-button" onClick={openModal}>Explore Our Menu</button>
          <div className="lwh-scroll-indicator"></div>
        </div>
      </header>

      <section id="experience" className="lwh-experience">
        <div className="lwh-experience-content">
          <h2 className="lwh-section-title">A Culinary Journey</h2>
          <p>Immerse yourself in the opulent world of Wazwan, where centuries-old recipes meet contemporary culinary artistry. Each dish is a masterpiece, crafted to transport you to the majestic valleys of Kashmir.</p>

        </div>
      </section>

      <section id="dishes" className="lwh-signature-dishes">
        <h2 className="lwh-section-title">Signature Dishes</h2>
        <div className="lwh-dish-carousel">
          {luxuryDishes.map((dish, index) => (
            <div
              key={index}
              className={`lwh-dish-item ${index === activeIndex ? 'active' : ''}`}
            >
              <h3>{dish.name}</h3>
              <p>{dish.description}</p>
            </div>
          ))}
        </div>
        <div className="lwh-dish-indicators">
          {luxuryDishes.map((_, index) => (
            <span
              key={index}
              className={`lwh-dish-indicator ${index === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
            ></span>
          ))}
        </div>
      </section>

      <section id="ambiance" className="lwh-ambiance">
        <div className="lwh-ambiance-content">
          <h2 className="lwh-section-title">Regal Ambiance</h2>
          <p>Step into a world where every detail exudes luxury. Our dining room, adorned with intricate Kashmiri artwork and plush furnishings, sets the stage for an unforgettable gastronomic experience.</p>
        </div>
        <div className="lwh-ambiance-gallery">
          <img src="https://images.unsplash.com/photo-1497644083578-611b798c60f3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Ambiance 1" />
          <img src="https://images.unsplash.com/photo-1497644083578-611b798c60f3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Ambiance 2" />
          <img src="https://images.unsplash.com/photo-1497644083578-611b798c60f3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Ambiance 3" />
        </div>
      </section>

      <section id="reservation" className="lwh-reservation">
        <h2 className="lwh-section-title">Reserve Your Royal Experience</h2>
        <form className="lwh-reservation-form">
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <input type="date" required />
          <input type="time" required />
          <select required>
            <option value="">Number of Guests</option>
            <option value="2">2 Guests</option>
            <option value="4">4 Guests</option>
            <option value="6">6 Guests</option>
            <option value="8+">8+ Guests</option>
          </select>
          <button type="submit" className="lwh-submit-button">Secure Your Table</button>
        </form>
      </section>
      <motion.div
        className="feedback-button-container"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <button className="feedback-icon-button" onClick={handleFeedbackClick}>
          <MessageSquare size={24} color="#4CAF50" />
        </button>
      </motion.div>
      {showModal && <Modal onClose={closeModal} />}

    </div>



  );
};

export default Home;
