import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { useCart } from './CartContext';
import {
    ShoppingCart,
    Minus,
    Plus,
    Trash2,
    CheckCircle,
    User,
    MapPin
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Cart.css';

const Cart = () => {
    // Update destructuring to match new CartContext structure
    const {
        cart: cartItems,
        removeFromCart,
        updateCartItemQuantity,
        clearCart
    } = useCart();

    const [isModalOpen, setModalOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const [userAddress, setUserAddress] = useState('');
    const navigate = useNavigate();
    const [mobileNumber, setMobileNumber] = useState('');



    const handleMobileChange = (e) => {
        setMobileNumber(e.target.value);  // Update state when the user enters the mobile number
    };


    useEffect(() => {
        const handleLoginStatusChange = () => {
            clearCart();
            toast.info('Cart cleared due to login status change.');
        };

        window.addEventListener('loginStatusChange', handleLoginStatusChange);

        return () => {
            window.removeEventListener('loginStatusChange', handleLoginStatusChange);
        };
    }, [clearCart]);

    const handleCheckout = () => {
        setModalOpen(true);
    };

   

    const handlePlaceOrder = async () => {
        // Validate name
        if (!userName.trim()) {
            toast.error('Please enter your name to place the order.');
            return;
        }
    
        const selectedTable = localStorage.getItem('selectedTable');
        
        // Determine mobile number prioritizing localStorage, then manual input
        const finalMobileNumber = localStorage.getItem('mobileNumber') || mobileNumber;
    
        // Validation for mobile number
        if (!finalMobileNumber) {
            toast.error('Please enter a mobile number.');
            return;
        }
    
        // Validate table number
        if (!selectedTable) {
            toast.error('Table number is missing!');
            return;
        }
    
        // Prepare order items with required fields
        const orderItems = cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        }));
    
        try {
            const response = await axios.post('http://localhost:5000/orders/checkout', {
                items: orderItems,
                selectedTable,
                mobileNumber: finalMobileNumber,
                userName,
                userAddress: userAddress || '', 
            });
    
            if (response.data.success) {
                const { orderId } = response.data;

                toast.success('Order placed successfully!');

                localStorage.removeItem('selectedTable');
                localStorage.removeItem('mobileNumber');
    

                navigate(`/order-success/${orderId}`);

    
            
                clearCart();
                setModalOpen(false);
            } else {
                toast.error(response.data.message || 'Failed to place the order.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('An error occurred while placing the order. Please try again.');
        }
    };


   
    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  
    if (cartItems.length === 0) {
        return (
            <div className="cart-container-empty">
                <ShoppingCart size={64} className="empty-cart-icon" />
                <h2>Your Cart is Empty</h2>
                <p>Looks like you haven't added anything to your cart yet.</p>
                <Link to="/menu" className="explore-menu-btn">
                    Explore Menu
                </Link>
                <ToastContainer />
            </div>
        );
    }

    return (
        <div className="cart-container">
            <div className="cart-header">
                <ShoppingCart size={32} />
                <h2>Your Cart</h2>
            </div>

            <div className="cart-items-list">
                {cartItems.map((item) => (
                    <div key={item.id} className="cart-item-card">
                        <div className="cart-item-image-wrapper">
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="cart-item-image"
                            />
                        </div>
                        <div className="cart-item-details">
                            <h3>{item.name}</h3>
                            <p className="item-price">₹{item.price}</p>
                            <div className="quantity-control-modern">
                                <button
                                    onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                >
                                    <Minus size={16} />
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                    onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="cart-item-actions">
                            <div className="item-total">
                                ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                            <button
                                className="remove-item-btn"
                                onClick={() => {
                                    removeFromCart(item.id);
                                    toast.info('Item removed from cart.');
                                }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="cart-summary-modern">
                <div className="summary-details">
                    <span>Total</span>
                    <h3>₹{cartTotal.toFixed(2)}</h3>
                </div>
                <button
                    className="checkout-btn-modern"
                    onClick={handleCheckout}
                >
                    Proceed to Checkout
                </button>
            </div>

            {/* Checkout Modal */}
            {isModalOpen && (
                <div className="checkout-modal-overlay">
                    <div className="checkout-modal">
                        <div className="modal-header">
                            <h2>Confirm Your Order</h2>
                            <button
                                className="modal-close-btn"
                                onClick={() => setModalOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-order-summary">
                            {cartItems.map((item) => (
                                <div key={item.id} className="modal-order-item">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="modal-item-image"
                                    />
                                    <div className="modal-item-details">
                                        <h4>{item.name}</h4>
                                        <p>
                                            {item.quantity} × ₹{item.price} =
                                            ₹{(item.quantity * item.price).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="modal-input-section">
                            <div className="input-wrapper">
                                <User size={20} className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-wrapper">
                                <MapPin size={20} className="input-icon" />
                                {!localStorage.getItem('mobileNumber') ? (
                                    <input
                                        type="text"
                                        placeholder="Phone Number"
                                        value={mobileNumber}
                                        onChange={handleMobileChange}
                                        required
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        placeholder="Address (Optional)"
                                        value={userAddress}
                                        onChange={(e) => setUserAddress(e.target.value)}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="modal-total-section">
                            <span>Total Amount</span>
                            <h3>₹{cartTotal.toFixed(2)}</h3>
                        </div>

                        <button
                            className="place-order-btn"
                            onClick={handlePlaceOrder}
                        >
                            <CheckCircle size={20} />
                            Place Order                             
                        </button>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default Cart;