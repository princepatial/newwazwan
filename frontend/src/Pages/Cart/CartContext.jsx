import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the Cart Context
const CartContext = createContext();

// Create a Provider Component
export const CartProvider = ({ children }) => {
    // Initialize cart items and timestamp from localStorage or empty array
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cartItems');
        const savedTimestamp = localStorage.getItem('cartTimestamp');
        if (savedCart && savedTimestamp) {
            const currentTime = Date.now();
            const elapsedTime = currentTime - parseInt(savedTimestamp, 10);
            if (elapsedTime > 600000) {
                // Clear cart if more than 10 minutes have passed
                localStorage.removeItem('cartItems');
                localStorage.removeItem('cartTimestamp');
                return [];
            }
            return JSON.parse(savedCart);
        }
        return [];
    });

    // Save cart to localStorage whenever cart items change
    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem('cartItems', JSON.stringify(cart));
            localStorage.setItem('cartTimestamp', Date.now().toString()); // Update timestamp
        } else {
            // Clear localStorage if cart is empty
            localStorage.removeItem('cartItems');
            localStorage.removeItem('cartTimestamp');
        }
    }, [cart]);

    // Function to add an item to the cart
    const addToCart = (item) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                // If item exists, increase its quantity
                return prevCart.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: (cartItem.quantity || 1) + 1 }
                        : cartItem
                );
            }
            // If not, add new item with quantity 1
            return [...prevCart, { ...item, quantity: 1 }];
        });
    };

    // Function to remove an item from the cart
    const removeFromCart = (itemId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    };

    // Function to update the quantity of an item in the cart
    const updateCartItemQuantity = (itemId, newQuantity) => {
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === itemId
                    ? { ...item, quantity: newQuantity }
                    : item
            ).filter(item => item.quantity > 0) // Remove items with zero quantity
        );
    };

    // Clear entire cart
    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateCartItemQuantity,
            clearCart,
            cartItemCount: cart.reduce((total, item) => total + (item.quantity || 0), 0)
        }}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook to use the cart context
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
