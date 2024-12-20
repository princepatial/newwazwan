import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import './NewCustomer.css';

const NewCustomer = () => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tables');
        if (response.status === 200) {
          const sortedTables = response.data.tables.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
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
  };

  const handleMobileChange = (e) => {
    setMobileNumber(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTable) {
      toast.error('Please select a table!');
      return;
    }

    if (!mobileNumber || mobileNumber.length !== 10 || isNaN(mobileNumber)) {
      toast.error('Please enter a valid 10-digit mobile number!');
      return;
    }

    try {
      const response = await axios.get('http://localhost:5000/orders');
      if (response.status === 200) {
        const existingNumbers = response.data.orders.map((order) => order.mobileNumber);
        if (existingNumbers.includes(mobileNumber)) {
          toast.error('You are a regular customer. Please try with a new number!');
        } else {
          localStorage.setItem('selectedTable', selectedTable);
          localStorage.setItem('mobileNumber', mobileNumber);

          toast.success('Details submitted successfully!');
          setTimeout(() => navigate('/menu'), 1000);
        }
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Unable to validate mobile number. Please try again later.');
    }
  };

  return (
    <div className="new-customer-page">
      <div className="content-wrapper">
        <header className="page-header">
          <h1>Welcome to Wazwan Legacy</h1>
          <p>Embark on a Culinary Journey</p>
        </header>

        <div className="reservation-container">
          <div className="table-selection">
            <h2>
              Select Your Table <span className="mandatory">*</span>
            </h2>
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <div className="tables-grid">
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

          <div className="mobile-input-section">
            <h2>
              Your Contact <span className="mandatory">*</span>
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="tel"
                  placeholder="Enter your mobile number"
                  required
                  value={mobileNumber}
                  onChange={handleMobileChange}
                />
              </div>
              <button id="submit-button" type="submit">
                Confirm Reservation
              </button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
      />
    </div>
  );
};

export default NewCustomer;
