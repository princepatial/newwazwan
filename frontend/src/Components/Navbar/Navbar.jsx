import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../Pages/Cart/CartContext'; 
import logo from '../../assets/wazwan.svg' 
import './Navbar.css'


const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
    const { cartItemCount, clearCart } = useCart(); 



    const toggleNavbarCollapse = () => {
        setIsNavbarCollapsed(!isNavbarCollapsed);
    };

    const toggleMobileMenu = () => {
        const newMenuState = !isMobileMenuOpen;
        setIsMobileMenuOpen(newMenuState);
    
        if (newMenuState) {
            document.body.style.position = 'fixed';
            document.body.style.top = `-${window.scrollY}px`;
            document.body.style.width = '100%';
            document.body.classList.add('menu-open');
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
            document.body.classList.remove('menu-open');
        }
    };
    
    const closeMobileMenu = () => {
        if (isMobileMenuOpen) {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
            
            setIsMobileMenuOpen(false);
            document.body.classList.remove('menu-open');
        }
    };

    return (
        <nav className={`navbar vertical-navbar ${isNavbarCollapsed ? 'collapsed' : ''}`}>
            <div className="navbar-toggle-btn" onClick={toggleNavbarCollapse}>
                <MenuIcon />
            </div>

            <div className="container vertical-container">
                <div className="logo-section vertical-logo-section">
                    <img 
                        src={logo} 
                        alt="Restaurant Logo" 
                        className="logo-image vertical-logo" 
                    />
                </div>

                <ul className={`nav-links vertical-nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <li onClick={closeMobileMenu}>
                        <NavLink 
                            to="/" 
                            className={({ isActive }) => 
                                `nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <span className="nav-icon"><HomeIcon /></span>
                            <span className="nav-text">Home</span>
                        </NavLink>
                    </li>
                    <li onClick={closeMobileMenu}>
                        <NavLink 
                            to="/menu" 
                            className={({ isActive }) => 
                                `nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <span className="nav-icon"><MenuIcon /></span>
                            <span className="nav-text">Menu</span>
                        </NavLink>
                    </li>
                    <li onClick={closeMobileMenu}>
                        <NavLink 
                            to="/checkout" 
                            className={({ isActive }) => 
                                `nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <span className="nav-icon"><CartIcon /></span>
                            <span className="nav-text">Cart</span>
                            {cartItemCount > 0 && (
                                <span className="cart-badge">{cartItemCount}</span>
                            )}
                        </NavLink>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
