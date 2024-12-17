import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import './TrackOrder.css';

const TrackOrder = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const autoRefreshRef = useRef(null);

  const [stages, setStages] = useState([
    {
      id: 'pending',
      emoji: '📋',
      title: 'Order Received',
      description: 'Our chefs are preparing your delightful meal',
      completed: false
    },
    {
      id: 'accepted',
      emoji: '🥘',
      title: 'Cooking Process',
      description: 'Fresh ingredients being transformed',
      completed: false
    },
    {
      id: 'ready',
      emoji: '🍽️',
      title: 'Plating & Finishing',
      description: 'Final touches and quality check',
      completed: false
    }
  ]);

  const { orderId } = useParams();
  const navigate = useNavigate();

  // WebSocket connection with improved error handling
  const connectWebSocket = useCallback(() => {
    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  
    const newSocket = io('http://localhost:5000/orders', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      rejectUnauthorized: false,
      withCredentials: false,
      extraHeaders: {
        'X-Custom-Header': 'TrackOrder'
      }
    });
  
    socketRef.current = newSocket;
  
    newSocket.on('connect', () => {
      console.log('WebSocket connected successfully');
      newSocket.emit('joinOrder', orderId);
    });
  
    newSocket.on('orderStatusUpdated', (updatedOrder) => {
      console.log('Real-time order status update:', updatedOrder);
      setOrderDetails(prev => ({
        ...prev,
        orderStatus: updatedOrder.orderStatus
      }));
      updateOrderStages(updatedOrder.orderStatus);
    });
  
    newSocket.on('connect_error', (error) => {
      console.error('Detailed WebSocket connection error:', error);
    });
  
    return newSocket;
  }, [orderId]);

  // Comprehensive order details fetching from database
  const fetchOrderDetailsFromDB = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/orders/status/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch order details: ${errorText}`);
      }

      const data = await response.json();
      
      // Ensure comprehensive order details are set
      setOrderDetails(prevDetails => {
        const hasChanged = JSON.stringify(prevDetails) !== JSON.stringify({
          orderId: data.orderId,
          orderStatus: data.orderStatus,
          selectedTable: data.selectedTable,
          userName: data.userName,
          mobileNumber: data.mobileNumber,
          items: data.items,
          createdAt: data.createdAt
        });

        if (hasChanged) {
          updateOrderStages(data.orderStatus);
        }

        return {
          orderId: data.orderId,
          orderStatus: data.orderStatus,
          selectedTable: data.selectedTable,
          userName: data.userName,
          mobileNumber: data.mobileNumber,
          items: data.items,
          createdAt: data.createdAt
        };
      });

      // Remove initial loading state after first successful fetch
      if (isLoading) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error.message);
      setIsLoading(false);
    }
  }, [orderId, isLoading]);

  // Update stages based on order status
  const updateOrderStages = (currentStatus) => {
    const statusPriority = ['pending', 'accepted', 'ready'];
    const currentIndex = statusPriority.indexOf(currentStatus?.toLowerCase() || 'pending');

    const updatedStages = stages.map((stage, index) => ({
      ...stage,
      completed: index <= currentIndex
    }));

    setStages(updatedStages);
    setProgress(currentIndex > 0 ? (currentIndex / (statusPriority.length - 1)) * 100 : 0);
  };

  // Fetch order details and set up WebSocket on mount
  useEffect(() => {
    fetchOrderDetailsFromDB();
    const socket = connectWebSocket();

    // Set up auto-refresh with slight randomization
    autoRefreshRef.current = setInterval(() => {
      fetchOrderDetailsFromDB();
    }, 2500 + Math.random() * 500);

    // Cleanup function
    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [fetchOrderDetailsFromDB, connectWebSocket]);

  // Rest of the component remains the same as in previous implementation
  // (render methods, error handling, etc.)

  // Loading state
  if (isLoading) {
    return (
      <div className="track-order-container loading">
        <Loader2 size={64} className="animate-spin" />
        <p>Loading order details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="track-order-container error">
        <AlertCircle size={64} color="red" />
        <p>Error: {error}</p>
        <div className="error-actions">
          <button onClick={() => navigate(-1)}>Go Back</button>
          <button onClick={fetchOrderDetailsFromDB}>Retry</button>
        </div>
      </div>
    );
  }

  // No order details state
  if (!orderDetails) {
    return (
      <div className="track-order-container error">
        <AlertCircle size={64} color="red" />
        <p>No order details found.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="track-order-container"
    >
      {/* Existing render logic from previous implementation */}
      <div className="track-order-content">
        <div className="order-progress-header">
          <h1>Track Your Order</h1>
          <button className="back-button" onClick={() => navigate(-1)}>
            &#8592; Back
          </button>
          <p>Order Number: {orderDetails.orderId || 'N/A'}</p>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{
              width: `${progress}%`,
              backgroundColor: progress === 100 ? '#4CAF50' : '#FFA500'
            }}
          ></div>
          <div className="progress-text">
            <span>{orderDetails.orderStatus || 'Unknown Status'}</span>
            <span>{`${Math.floor(progress)}%`}</span>
          </div>
        </div>

        {/* Order Stages */}
        <div className="order-stages">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{
                opacity: 1,
                x: 0,
                transition: { delay: index * 0.3 },
              }}
              className={`stage ${stage.completed ? 'completed' : ''}`}
            >
              <div className="stage-emoji">
                {stage.completed ? <CheckCircle color="#4CAF50" /> : stage.emoji}
              </div>
              <div className="stage-details">
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Details Section */}
        <div className="order-details-section">
          <h2>Order Summary</h2>
          <div className="order-details-grid">
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className="detail-value">{orderDetails.orderStatus || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Table</span>
              <span className="detail-value">{orderDetails.selectedTable || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Name</span>
              <span className="detail-value">{orderDetails.userName || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Mobile</span>
              <span className="detail-value">{orderDetails.mobileNumber || 'N/A'}</span>
            </div>
          </div>

          <div className="order-items-section">
            <h3>Order Items</h3>
            <ul>
              {orderDetails.items && orderDetails.items.length > 0 ? (
                orderDetails.items.map((item, index) => (
                  <li key={index}>
                    {item.name || 'Unknown Item'} - Qty: {item.quantity || 0} - ₹{item.price || 0}
                  </li>
                ))
              ) : (
                <li>No items in this order</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TrackOrder;