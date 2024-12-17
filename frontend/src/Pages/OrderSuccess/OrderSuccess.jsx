import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import io from 'socket.io-client';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { orderId } = useParams();
  const [socket, setSocket] = useState(null);

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

      // Save to local storage only if status is accepted
      if (data.orderStatus === 'accepted') {
        localStorage.setItem('orderStatus', 'accepted');
        localStorage.setItem('orderId', data.orderId);
      } else {
        // Remove from local storage if status is not accepted
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

      // Save to local storage only if status is accepted
      if (order.orderStatus === 'accepted') {
        localStorage.setItem('orderStatus', 'accepted');
        localStorage.setItem('orderId', order.orderId);
      } else {
        // Remove from local storage if status is not accepted
        localStorage.removeItem('orderStatus');
        localStorage.removeItem('orderId');
      }

      updateOrderState(order);
      setIsLoading(false);
    });

    newSocket.on('orderStatusUpdated', (updatedOrder) => {
      console.log('Real-time order status update:', updatedOrder);
      updateOrderState(updatedOrder);

      // Remove from local storage if status is not accepted
      if (updatedOrder.orderStatus !== 'accepted') {
        localStorage.removeItem('orderStatus');
        localStorage.removeItem('orderId');
      } else {
        // Ensure it's saved when accepted
        localStorage.setItem('orderStatus', 'accepted');
        localStorage.setItem('orderId', updatedOrder.orderId);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setError('Unable to connect to real-time updates');
      setIsLoading(false);
    });

    // Set up interval to fetch order status every 2 seconds
    const statusInterval = setInterval(fetchOrderDetails, 2000);

    // Cleanup function
    return () => {
      // Clear the interval
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

  // Helper function to update order state consistently
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
        return { color: '#FFA500', icon: <Loader2 size={64} color="#FFA500" /> };
      case 'accepted':
        return { color: '#4CAF50', icon: <CheckCircle size={64} color="#4CAF50" /> };
      case 'preparing':
        return { color: '#2196F3', icon: <Loader2 size={64} color="#2196F3" /> };
      case 'ready':
        return { color: '#4CAF50', icon: <CheckCircle size={64} color="#4CAF50" /> };
      case 'delivered':
        return { color: '#4CAF50', icon: <CheckCircle size={64} color="#4CAF50" /> };
      case 'rejected':
        return { color: 'red', icon: <AlertCircle size={64} color="red" /> };
      default:
        return { color: '#FFA500', icon: <Loader2 size={64} color="#FFA500" /> };
    }
  };

  if (isLoading) {
    return (
      <div className="order-loading">
        <Loader2 size={64} className="animate-spin" />
        <p>Fetching your order details...</p>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="order-error">
        <AlertCircle size={64} color="red" />
        <h2>Order Details Not Found</h2>
        <p>{error || 'Unable to retrieve order information.'}</p>
        <Link to="/menu" className="action-button1">Back to Menu</Link>
      </div>
    );
  }

  const { color, icon } = getStatusStyle(orderDetails.orderStatus);

  return (
    <div className="elegant-order-success">
      <div className="order-success-content">
        <div className="success-icon" style={{ color }}>
          {icon}
        </div>

        <h1 className="success-title" style={{ color }}>
          Order {orderDetails.orderStatus}
        </h1>

        <div className="order-details">
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

          <div className="order-items">
            <h3>Order Items:</h3>
            <ul>
              {orderDetails.items.map((item, index) => (
                <li key={index}>
                  {item.name} - Quantity: {item.quantity} - Price: ₹{item.price}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="order-actions">
          <Link to="/menu" className="action-button1">Continue Browsing</Link>
          <Link to={`/track-order/${orderDetails.orderId}`} className="action-button1 secondary">
            Track Order
          </Link>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default OrderSuccess;