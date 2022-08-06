import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { TextField, Autocomplete } from '@mui/material';
import Stock from './stock';
import "bootstrap/dist/css/bootstrap.css";

const Stocks = () => {
  let port = process.env.PORT;

  if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
    port = process.env.REACT_APP_API_PORT;
  }

  console.log(port);
  
  let navigate = useNavigate();

  const [stocks, setStocks] = useState([]);
  const [stock, setStock] = useState(null);

  useEffect(() => {
    // console.log(`loading s&p 500 stocks...`);

    const getStocks = async () => {
      try {
        // const response = await fetch(`http://localhost:${port}/sp-500`);
        const response = await fetch(`/sp-500`);
 
        if (!response.ok) {
          const message = `An error occurred: ${response.statusText}`;
          window.alert(message);
        }
    
        const stocksList = await response.json();
        setStocks(stocksList);
      } catch (err) {
        console.log(err.message);
        alert(err.message);
      }
    };

    getStocks();
  }, []);

  const handleChange = (stock) => {
    setStock(stock);
    navigate(`/chart/${stock.ticker}`);
  };
  // useEffect(() => {
  //   navigate(`/chart/${stock.ticker}`);
  // }, [stock]);

  return (
    <div style={{ marginLeft: 20, marginRight: 20, marginTop: 20}}>
      <Autocomplete
        disablePortal
        id="stock-search"
        options={ stocks }
        renderInput={(params) => <TextField {...params} label="Stock" />}
        getOptionLabel={ option => (`${option.companyName} (${option.ticker})`) }
        value={stock}
        onChange={ (_event, newStock) => handleChange(newStock) }
        sx={{ width: 300 }}
      />
      <h3 className="text-start" style={{ marginTop: 20 }}>S&amp;P 500</h3>
      <table className="table table-bordered" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th className="text-start">Ticker</th>
            <th className="text-start">Company Name</th>
          </tr>
        </thead>
        <tbody>
          {
            stocks.map((stock) => <Stock key={ stock._id } stock={ stock } />)
          }
        </tbody>
      </table>
    </div>
  );
};

export default Stocks;
