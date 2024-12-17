import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { CheckCircle, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import './OrderSuccess.css';


const OrderSuccess = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { orderId } = useParams();
  const [socket, setSocket] = useState(null);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(true);
  const navigate = useNavigate();


  const handleFeedbackClick = () => {
    navigate('/feedback', { state: { orderId: orderDetails.orderId } });
  };




  const fetchOrderDetails = async () => {
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

      if (data.orderStatus === 'accepted') {
        localStorage.setItem('orderStatus', 'accepted');
        localStorage.setItem('orderId', data.orderId);
      } else {
        localStorage.removeItem('orderStatus');
        localStorage.removeItem('orderId');
      }

      setOrderDetails(prevDetails => ({
        ...prevDetails,
        orderStatus: data.orderStatus
      }));
    } catch (err) {
      console.error('Error fetching order status:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided');
      setIsLoading(false);
      return;
    }

    let newSocket;
    if (!socket) {
      newSocket = io('http://localhost:5000/orders', {
        transports: ['websocket'],
        upgrade: false,
      });
      setSocket(newSocket);
    } else {
      newSocket = socket;
    }

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      newSocket.emit('joinOrder', orderId);
    });

    newSocket.on('orderDetails', (order) => {
      console.log("Received initial order details:", order);

      if (order.orderStatus === 'accepted') {
        localStorage.setItem('orderStatus', 'accepted');
        localStorage.setItem('orderId', order.orderId);
      } else {
        localStorage.removeItem('orderStatus');
        localStorage.removeItem('orderId');
      }

      updateOrderState(order);
      setIsLoading(false);
    });

    newSocket.on('orderStatusUpdated', (updatedOrder) => {
      console.log('Real-time order status update:', updatedOrder);
      updateOrderState(updatedOrder);

      if (updatedOrder.orderStatus !== 'accepted') {
        localStorage.removeItem('orderStatus');
        localStorage.removeItem('orderId');
      } else {
        localStorage.setItem('orderStatus', 'accepted');
        localStorage.setItem('orderId', updatedOrder.orderId);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setError('Unable to connect to real-time updates');
      setIsLoading(false);
    });

    const statusInterval = setInterval(fetchOrderDetails, 2000);

    return () => {
      clearInterval(statusInterval);

      if (newSocket) {
        console.log('Cleaning up WebSocket connection');
        newSocket.off('connect');
        newSocket.off('orderDetails');
        newSocket.off('orderStatusUpdated');
        newSocket.off('connect_error');
      }
    };
  }, [orderId, socket]);

  const updateOrderState = (order) => {
    setOrderDetails(prevDetails => ({
      orderId: order.orderId,
      orderStatus: order.orderStatus || prevDetails?.orderStatus,
      createdAt: order.createdAt || prevDetails?.createdAt,
      items: order.items || prevDetails?.items,
      selectedTable: order.selectedTable || prevDetails?.selectedTable,
      mobileNumber: order.mobileNumber || prevDetails?.mobileNumber,
      userName: order.userName || prevDetails?.userName,
      userAddress: order.userAddress || prevDetails?.userAddress,
    }));
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { color: '#FFA500', icon: <Loader2 size={64} color="#FFA500" className="animate-spin" /> };
      case 'accepted':
        return { color: '#4CAF50', icon: <CheckCircle size={64} color="#4CAF50" /> };
      case 'preparing':
        return { color: '#2196F3', icon: <Loader2 size={64} color="#2196F3" className="animate-spin" /> };
      case 'ready':
        return { color: '#4CAF50', icon: <CheckCircle size={64} color="#4CAF50" /> };
      case 'delivered':
        return { color: '#4CAF50', icon: <CheckCircle size={64} color="#4CAF50" /> };
      case 'rejected':
        return { color: 'red', icon: <AlertCircle size={64} color="red" /> };
      default:
        return { color: '#FFA500', icon: <Loader2 size={64} color="#FFA500" className="animate-spin" /> };
    }
  };

  if (isLoading) {
    return (
      <motion.div
        className="order-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Loader2 size={64} className="animate-spin" />
        <p>Fetching your order details...</p>
      </motion.div>
    );
  }

  if (error || !orderDetails) {
    return (
      <motion.div
        className="order-error"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <AlertCircle size={64} color="red" />
        <h2>Order Details Not Found</h2>
        <p>{error || 'Unable to retrieve order information.'}</p>
        <Link to="/menu" className="action-button">Back to Menu</Link>
      </motion.div>
    );
  }

  const { color, icon } = getStatusStyle(orderDetails.orderStatus);

  return (
    <motion.div
      className="elegant-order-success"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="order-success-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="success-icon"
          style={{ color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
        >
          {icon}
        </motion.div>

        <motion.h1
          className="success-title"
          style={{ color }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Order {orderDetails.orderStatus}
        </motion.h1>

        <motion.div
          className="order-details"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Order Number</span>
              <span className="detail-value">{orderDetails.orderId}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Order Status</span>
              <span className="detail-value" style={{ color }}>
                {orderDetails.orderStatus}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date</span>
              <span className="detail-value">
                {new Date(orderDetails.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Table</span>
              <span className="detail-value">{orderDetails.selectedTable}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Name</span>
              <span className="detail-value">{orderDetails.userName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Mobile</span>
              <span className="detail-value">{orderDetails.mobileNumber}</span>
            </div>
          </div>

          <motion.div
            className="order-items"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3>Order Items:</h3>
            <ul>
              {orderDetails.items.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  {item.name} - Quantity: {item.quantity} - Price: ₹{item.price}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          className="order-actions"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link to="/menu" className="action-button primary">Continue Browsing</Link>
          <Link to={`/track-order/${orderDetails.orderId}`} className="action-button secondary">
            Track Order
          </Link>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showFeedbackPopup && (
          <motion.div
            className="feedback-popup"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="feedback-content" onClick={handleFeedbackClick}>
              <MessageSquare size={24} color="#4CAF50" />
              <h3>We Value Your Feedback!</h3>
              <p>Help us improve by sharing your experience.</p>
              <button className="feedback-button">Give Feedback</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer />
    </motion.div>
  );
};

export default OrderSuccess;
