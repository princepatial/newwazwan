import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './CartContext';
import {
    ShoppingCart,
    Minus,
    Plus,
    Trash2,
    CheckCircle,
    User,
    PlusCircle,
    ArrowRight
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Cart.css';

const SuggestedItems = ({ onAddToCart }) => {
    const [suggestedItems, setSuggestedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchSuggestedItems = async () => {
            try {
                const response = await axios.get('http://51.20.97.10/api/products');
                const randomItems = response.data
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 4);
                setSuggestedItems(randomItems);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch suggested items:', error);
                setLoading(false);
            }
        };
        
        fetchSuggestedItems();
    }, []);

    if (loading) {
        return <div className="suggested-items-loading">Loading suggestions...</div>;
    }

    return (
        <div className="suggested-items-section">
            <div className="suggested-items-header">
                <h3>Add More Items</h3>
                <p>You might also like these</p>
            </div>
            <div className="suggested-items-grid">
                {suggestedItems.map((item) => (
                    <div key={item._id} className="suggested-item-card">
                        <div className="suggested-item-image-wrapper">
                            <img 
                                src={item.imageUrl || '/default-image.jpg'} 
                                alt={item.itemName}
                                className="suggested-item-image"
                            />
                        </div>
                        <div className="suggested-item-details">
                            <h4>{item.itemName}</h4>
                            <p className="suggested-item-price">₹{item.sellPrice}</p>
                            <button
                                onClick={() => onAddToCart({
                                    id: item._id,
                                    name: item.itemName,
                                    price: item.sellPrice,
                                    imageUrl: item.imageUrl || '/default-image.jpg'
                                })}
                                className="suggested-item-add-btn"
                            >
                                <PlusCircle size={16} />
                                Add
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Cart = () => {
    const {
        cart: cartItems,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        addToCart
    } = useCart();

    const [isModalOpen, setModalOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

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
        const selectedTable = localStorage.getItem('selectedTable');
        const mobileNumber = localStorage.getItem('mobileNumber');

        if (mobileNumber && !userName.trim()) {
            toast.error('Please enter your name to place the order.');
            return;
        }

        if (!selectedTable) {
            toast.error('Table number is missing!');
            return;
        }

        const orderItems = cartItems.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        }));

        try {
            const response = await axios.post('http://localhost:5000/orders/checkout', {
                items: orderItems,
                selectedTable,
                mobileNumber: mobileNumber || '',
                userName: mobileNumber ? userName : '',
                totalAmount: cartTotal
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

    const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const gst = cartTotal * 0.05;
    const finalAmount = cartTotal + gst;

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
        <div className="cart-page-container">
            <div className="cart-main-content">
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
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <h3>₹{cartTotal.toFixed(2)}</h3>
                            </div>
                            <div className="summary-row">
                                <span>GST (5%)</span>
                                <h3>₹{gst.toFixed(2)}</h3>
                            </div>
                            <div className="summary-row total-row">
                                <span>Total Amount</span>
                                <h3 className="total-with-gst">₹{finalAmount.toFixed(2)}</h3>
                            </div>
                        </div>
                        <button
                            className="checkout-btn-modern"
                            onClick={handleCheckout}
                        >
                            Proceed to Checkout
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="suggested-items-sidebar">
                <SuggestedItems onAddToCart={(item) => {
                    addToCart(item);
                    toast.success(`${item.name} added to cart!`);
                }} />
            </div>

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

                        <div className="modal-total-section">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <h3>₹{cartTotal.toFixed(2)}</h3>
                            </div>
                            <div className="summary-row">
                                <span>GST (5%)</span>
                                <h3>₹{gst.toFixed(2)}</h3>
                            </div>
                            <div className="summary-row total-row">
                                <span>Total Amount</span>
                                <h3 className="total-with-gst">₹{finalAmount.toFixed(2)}</h3>
                            </div>
                        </div>

                        {localStorage.getItem('mobileNumber') && (
                            <div className="modal-input-section">
                                <div className="input-wrapper">
                                    <User size={20} className="input-icon" />
                                    <input
                                        type="text"
                                        placeholder="Your Name *"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

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