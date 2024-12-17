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
  };

  const handleMobileChange = (e) => {
    setMobileNumber(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedTable) {
      toast.error('Please select a table!');
      return;
    }

    if (!mobileNumber || mobileNumber.length !== 10 || isNaN(mobileNumber)) {
      toast.error('Please enter a valid 10-digit mobile number!');
      return;
    }

    localStorage.setItem('selectedTable', selectedTable);
    localStorage.setItem('mobileNumber', mobileNumber);

    toast.success('Details submitted successfully!');
    setTimeout(() => navigate('/menu'), 1000);
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
            <h2>Select Your Table</h2>
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <div className="tables-grid">
                {tables.map((table) => (
                  <button
                    key={table._id}
                    className={`table-button ${selectedTable === table.name ? 'selected' : ''} ${table.status}`}
                    onClick={() => handleTableClick(table.name)}
                    disabled={table.status !== 'available'}
                  >
                    {table.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mobile-input-section">
            <h2>Your Contact</h2>
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
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default NewCustomer;
