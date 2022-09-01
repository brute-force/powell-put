import { Autocomplete, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertSnackbar from './AlertSnackbar';

function Stocks() {
  const navigate = useNavigate();

  const [stocks, setStocks] = useState([]);
  const [stock, setStock] = useState(null);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const getStocks = async () => {
      const feed =
        process.env.NODE_ENV !== 'production'
          ? `http://192.168.1.62:${process.env.REACT_APP_API_PORT}/sp-500`
          : '/sp-500';

      try {
        const response = await fetch(feed);
        const stocksList = await response.json();
        setStocks(stocksList);
      } catch (err) {
        setMessage(err.message);
        setSeverity('error');
        setOpen(true);
      }
    };

    getStocks();
  }, []);

  const handleChange = async (event, value) => {
    event.preventDefault();

    const ticker = value.ticker ? value.ticker : value;
    const feed =
      process.env.NODE_ENV !== 'production'
        ? `http://192.168.1.62:${process.env.REACT_APP_API_PORT}/search`
        : '/search';

    try {
      const response = await fetch(`${feed}?ticker=${ticker}`);
      const result = await response.json();

      if (result.length === 1) {
        setStock(!value.ticker ? { ticker, companyName: result[0].shortname } : value);
        navigate(`/chart/${ticker}`);
      } else {
        throw Error(`${ticker} not found`);
      }
    } catch (err) {
      setStock(null);
      setMessage(err.message);
      setSeverity('error');
      setOpen(true);
    }
  };

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Autocomplete
        id="stock-search"
        freeSolo
        disableClearable
        value={stock}
        options={stocks}
        onChange={handleChange}
        renderInput={(params) => (
          <TextField
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...params}
            label="Search"
            InputProps={{
              ...params.InputProps,
              type: 'search'
            }}
          />
        )}
        getOptionLabel={(option) => option.companyName && option.ticker && `${option.companyName} (${option.ticker})`}
        // sx={{ width: 300 }}
      />
      <AlertSnackbar message={message} open={open} setOpen={setOpen} severity={severity} />
    </Stack>
  );
}

export default Stocks;
