
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../Cart/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Menu.css';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const { addToCart, cart = [], removeFromCart, updateCartItemQuantity } = useCart();
  const [addedItems, setAddedItems] = useState({});
  const navigate = useNavigate();

  const handleGoToCart = () => {
    navigate('/checkout');
  };

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get('http://51.20.97.10/api/products');
        setMenuItems(response.data);
        setFilteredItems(response.data);
      } catch (error) {
        toast.error('Failed to fetch menu items. Please try again.');
      }
    };
    fetchMenuItems();
  }, []);

  const handleAddToCart = (item) => {
    addToCart({
      id: item._id,
      name: item.itemName,
      price: item.sellPrice,
      image: item.imageUrl || '/default-image.jpg',
      imageUrl: item.imageUrl || '/default-image.jpg',
    });
    setAddedItems((prev) => ({
      ...prev,
      [item._id]: true,
    }));
    toast.success(`${item.itemName} added to cart!`);
    setTimeout(() => {
      setAddedItems((prev) => ({
        ...prev,
        [item._id]: false,
      }));
    }, 1000);
  };

  const handleQuantityChange = (item, change) => {
    const cartItem = cart.find(cartItem => cartItem.id === item._id);
    if (cartItem) {
      const newQuantity = cartItem.quantity + change;
      if (newQuantity > 0) {
        updateCartItemQuantity(item._id, newQuantity);
        if (change > 0) {
          toast.success(`${item.itemName} quantity increased`);
        } else {
          toast.info(`${item.itemName} quantity decreased`);
        }
      } else {
        removeFromCart(item._id);
        toast.info(`${item.itemName} removed from cart`);
      }
    } else if (change > 0) {
      handleAddToCart(item);
    }
  };

  const handleFilter = (filter) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setFilteredItems(menuItems);
    } else {
      setFilteredItems(menuItems.filter((item) => item.type.toLowerCase() === filter));
    }
  };

  return (
    <div className="menu-container">
      <div className="menu-header">
        <h1 className="menu-title">Flavor Fusion</h1>
        <p className="menu-subtitle">Embark on a culinary journey through our exquisite menu</p>
      </div>

      <div className="filter-container">
  <div className="filter-buttons">
    {['all', 'veg', 'non-veg', 'beverage', 'starters', 'bread'].map((filter) => (
      <button
        key={filter}
        className={`filter-button ${activeFilter === filter ? 'active' : ''}`}
        onClick={() => handleFilter(filter)}
        style={{
          backgroundColor:
            activeFilter === filter
              ? filter === 'veg'
                ? ' #2ecc71'
                : filter === 'non-veg'
                ? '#e74c3c'
                : filter === 'beverage'
                ? '#9b59b6'
                : filter === 'starters'
                ? '#f39c12'
                : filter === 'bread'
                ? ' #8a5c33'
                : '#e94560'
              : '#0f3460',
        }}
      >
        {filter.charAt(0).toUpperCase() + filter.slice(1)}
      </button>
    ))}
  </div>
</div>


      <div className="menu-items">
        {filteredItems.map((item) => {
          const cartItem = cart.find(cartItem => cartItem.id === item._id);
          const currentQuantity = cartItem ? cartItem.quantity : 0;
          return (
            <div className="menu-item" key={item._id}>
              <div className="item-image-container">
                <img
                  src={item.imageUrl || '/default-image.jpg'}
                  alt={item.itemName}
                  className="item-image"
                />
              </div>
              <div className="item-details">
                <h3 className="item-name">{item.itemName}</h3>
                <p className="item-price1">₹{item.sellPrice}</p>
                {currentQuantity > 0 ? (
                  <div className="quantity-control">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item, -1)}
                    >
                      -
                    </button>
                    <span className="quantity-display">{currentQuantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item, 1)}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    className="add-to-cart"
                    onClick={() => handleAddToCart(item)}
                  >
                    {addedItems[item._id] ? 'Added!' : 'Add to Cart'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {cart.length > 0 && (
        <button className="go-to-cart-button" onClick={handleGoToCart}>
          View Cart
        </button>
      )}

      <ToastContainer />
    </div>
  );
};

export default Menu;
