import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { TextField, Autocomplete } from '@mui/material';
import Stock from './stock';
import "bootstrap/dist/css/bootstrap.css";

const Stocks = () => {

  
  let navigate = useNavigate();

  const [stocks, setStocks] = useState([]);
  const [stock, setStock] = useState(null);

  useEffect(() => {
    const getStocks = async () => {
      let feed = process.env.NODE_ENV !== 'production'
        ? `http://192.168.1.62:${process.env.REACT_APP_API_PORT}/sp-500`
        : '/sp-500';

      try {
        console.log(feed);
        const response = await fetch(feed);
        const stocksList = await response.json();
        setStocks(stocksList);
      } catch (err) {
        console.log(err.message);
      }
    };

    getStocks();
  }, []);

  const handleChange = (stock) => {
    setStock(stock);
    navigate(`/chart/${stock.ticker}`);
  };

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
