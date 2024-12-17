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
  const progressTimerRef = useRef(null);
  const progressStartTimeRef = useRef(null);

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

  // WebSocket connection (existing implementation)
  const connectWebSocket = useCallback(() => {
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

  // Fetch order details (existing implementation)
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

      if (isLoading) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error.message);
      setIsLoading(false);
    }
  }, [orderId, isLoading]);

  // Update order stages
  const updateOrderStages = (currentStatus) => {
    const statusPriority = ['pending', 'accepted', 'cooking', 'ready'];
    const currentIndex = statusPriority.indexOf(currentStatus?.toLowerCase() || 'pending');

    let updatedStages;
    let newProgress = progress;

    switch (currentStatus?.toLowerCase()) {
      case 'pending':
        updatedStages = stages.map(stage => ({ ...stage, completed: false }));
        newProgress = 0;
        // Stop and clear timer
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
          progressStartTimeRef.current = null;
        }
        break;
      case 'accepted':
        updatedStages = stages.map((stage, index) => ({
          ...stage,
          completed: index === 0
        }));

        // Start timer only if not already started
        if (!progressStartTimeRef.current) {
          startProgressTimer();
        }
        break;
      case 'cooking':
        updatedStages = stages.map((stage, index) => ({
          ...stage,
          completed: index <= 1
        }));
        break;
      case 'ready':
        updatedStages = stages.map(stage => ({
          ...stage,
          completed: true
        }));

        // Stop timer and set progress to 100%
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
          progressStartTimeRef.current = null;
        }
        newProgress = 100;
        break;
      default:
        updatedStages = stages;
    }

    setStages(updatedStages);
    setProgress(newProgress);
  };

  // Start progress timer
  const startProgressTimer = () => {
    const TOTAL_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

    // Set start time
    progressStartTimeRef.current = Date.now();

    progressTimerRef.current = setInterval(() => {
      if (!progressStartTimeRef.current) return;

      const elapsedTime = Date.now() - progressStartTimeRef.current;
      const newProgress = Math.min((elapsedTime / TOTAL_TIME) * 100, 100);

      setProgress(newProgress);

      // Stop timer and clear refs when 15 minutes are complete
      if (newProgress >= 100) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
        progressStartTimeRef.current = null;
        
        // Remove local storage after 15 minutes
        localStorage.removeItem(`order_progress_${orderId}`);
      }
    }, 1000);
  };

  // Main useEffect
  useEffect(() => {
    fetchOrderDetailsFromDB();
    const socket = connectWebSocket();

    autoRefreshRef.current = setInterval(() => {
      fetchOrderDetailsFromDB();
    }, 2500 + Math.random() * 500);

    return () => {
      if (socket) socket.disconnect();
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [fetchOrderDetailsFromDB, connectWebSocket]);

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
              width: `${orderDetails.orderStatus?.toLowerCase() === 'pending' ? 0 : progress}%`,
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