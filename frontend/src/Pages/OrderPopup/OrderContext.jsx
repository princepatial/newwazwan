import React, { createContext, useState, useContext } from 'react';

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const [orderStatus, setOrderStatus] = useState(null);
  const [orderId, setOrderId] = useState(null);

  return (
    <OrderContext.Provider value={{ 
      orderStatus, 
      setOrderStatus, 
      orderId, 
      setOrderId 
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }
  return context;
};