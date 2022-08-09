import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Autocomplete } from '@mui/material';

// import Stock from './stock';
// import "bootstrap/dist/css/bootstrap.css";

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
        const response = await fetch(feed);
        const stocksList = await response.json();
        setStocks(stocksList);
      } catch (err) {
        console.log(err.message);
      }
    };

    getStocks();
  }, []);

  const handleChange = async (event, value) => {
    event.preventDefault();

    let ticker = value.ticker ? value.ticker : value;
    let feed = process.env.NODE_ENV !== 'production'
      ? `http://192.168.1.62:${process.env.REACT_APP_API_PORT}/search`
      : '/search';

    try {
      const response = await fetch(`${feed}?ticker=${ticker}`);
      const result = await response.json();

      if (result.length === 1) {
        let stock = !value.ticker ? { ticker, companyName: result[0].shortname } : value;
        setStock(stock);
        navigate(`/chart/${ticker}`);
      } else {
        throw Error(`${ticker} not found`);
      }
    } catch (err) {
      console.log(`error: ${err.message}`);
      setStock(null);
    }   
  };

  return (
    <Autocomplete
      id="stock-search"
      freeSolo
      disableClearable
      value={stock}
      options={stocks}
      onChange={ handleChange }
      renderInput={(params) => (
        <TextField {...params}
          label="Search"
          InputProps={{
            ...params.InputProps,
            type: 'search'
          }}
        />
      )}
      getOptionLabel={ option => (option.companyName && option.ticker ? `${option.companyName} (${option.ticker})` : '') }
      sx={{ width: 300 }}
    />
  );
};

export default Stocks;
