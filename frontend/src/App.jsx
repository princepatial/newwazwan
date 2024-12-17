import React from 'react';
import { OrderProvider } from './Pages/OrderPopup/OrderContext'; // Adjust path as needed
import Navbar from './Components/Navbar/Navbar';
import Home from './Pages/Home/Home';
import Menu from './Pages/Menu/Menu';
import Cart from './Pages/Cart/Cart';
import NewCustomer from './Pages/TableSelection/NewCustomer';
import RegularCustomer from './Pages/TableSelection/RegularCustomer';
import Footer from './Components/Footer/Footer';
import { Routes, Route } from 'react-router-dom';
import OrderSuccess from './Pages/OrderSuccess/OrderSuccess';
import TrackOrder from './Pages/TrackOrder/TrackOrder';
import OrderPopup from './Pages/OrderPopup/OrderPopup';

function App() { 
  return (
    <OrderProvider>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new-customer" element={<NewCustomer />} />
          <Route path="/regular-customer" element={<RegularCustomer />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/checkout" element={<Cart />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/track-order/:orderId" element={<TrackOrder />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
        </Routes>
        <OrderPopup />
        <Footer />
      </div>
    </OrderProvider>
  );
}

export default App;