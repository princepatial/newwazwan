import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import './RegularCustomer.css'; // Use a separate CSS file

const RegularCustomer = () => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get('http://51.20.97.10/api/tables');
        if (response.status === 200) {
          const sortedTables = response.data.tables.sort((a, b) => a.name.localeCompare(b.name));
          setTables(sortedTables);
        } else {
          throw new Error('Failed to fetch tables');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tables:', error);
        toast.error('Unable to fetch tables. Please try again later.');
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const handleTableClick = (tableName) => {
    setSelectedTable(tableName);
    toast.success(`${tableName} selected!`);

    localStorage.setItem('selectedTable', tableName);
    setTimeout(() => {
      navigate('/menu');
    }, 1000);
  };

  return (
    <div className="rc-regular-customer-page"> 
      <div className="rc-content-wrapper">
        <header className="rc-page-header">
          <h1>Welcome Back to Wazwan Legacy</h1>
          <p>We’re excited to serve you again!</p>
        </header>

        <div className="rc-reservation-container">
          <div className="rc-table-selection">
            <h2>Select Your Table <span className="mandatory">*</span> 
               </h2>
            {loading ? (
              <div className="rc-loading-spinner"></div>
            ) : (
              <div className="rc-tables-grid">
                {tables.map((table) => (
                 <button
                 key={table._id}
                 className={`table-button ${
                   selectedTable === table.name ? 'selected' : ''
                 } ${table.status}`}
                 onClick={() => handleTableClick(table.name)}
                 disabled={table.status !== 'available'}
                 style={{
                   backgroundColor: table.status === 'unavailable' ? '#d3d3d3' : '', 
                   cursor: table.status !== 'available' ? 'not-allowed' : 'pointer',
                   border: table.status === 'unavailable' ? '2px solid red' : '',
                   opacity: table.status === 'unavailable' ? 0.5 : 1,
                 }}
               >
                 {table.name}
               </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default RegularCustomer;
