import {
  Link, Stack, Table, TableBody, TableCell, TableHead, TableRow, ToggleButton,
  ToggleButtonGroup, Typography
} from '@mui/material';
import { formatMoney, toFixed } from 'accounting';
import { DateTime } from 'luxon';
import { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChartContext } from '../contexts/ChartContext';
import ChartComponent from './ChartComponent';

// const dateFormatDefault = 'MM/dd/yy';
const now = DateTime.now();

const Chart = () => {
  const { dateFormatDefault } = useContext(ChartContext);

  const navigate = useNavigate();

  const { ticker }  = useParams();
  const [period1, setPeriod1] = useState(now.startOf('year').toFormat(dateFormatDefault));
  const [periodStart, setPeriodStart] = useState('');
  const [priceStart, setPriceStart] = useState(0);
  const [priceEnd, setPriceEnd] = useState(0);
  const [returnPct, setReturnPct] = useState(0);
  const [data, setData] = useState([]);
  const [companyName, setCompanyName] = useState('');

  const toggleButtons = [
    {
      label: '1 W',
      value: now.minus({ weeks: 1 }).toFormat(dateFormatDefault)
    },
    {
      label: '1 M',
      value: now.minus({ months: 1 }).toFormat(dateFormatDefault)
    },
    {
      label: '1 Y',
      value: now.minus({ years: 1 }).toFormat(dateFormatDefault)
    },
    {
      label: 'YTD',
      value: now.startOf('year').toFormat(dateFormatDefault)
    }
  ];

  // console.log(`loading data: ${ticker}`);

  useEffect(() => {
    const getHistoricalData = async () => {
      try {
        let feed = process.env.NODE_ENV !== 'production'
          ? `http://192.168.1.62:${process.env.REACT_APP_API_PORT}/historical`
          : '/historical';

        const response = await fetch(`${feed}?ticker=${ticker}&period1=${period1}`);
        const json = await response.json();
        const quotes = json.quotes;
        const quoteStart = quotes[0];
        const quoteEnd = quotes[quotes.length - 1];

        setPriceStart(quoteStart.close);
        setPriceEnd(quoteEnd.close);
        setReturnPct((quoteEnd.close/quoteStart.close - 1) * 100);
        // actual periods are interpolated to closest tradings days
        setPeriodStart(DateTime.fromISO(quoteStart.date).toFormat(dateFormatDefault));
        // setPriceChange(toFixed(quoteEnd.close - quoteStart.close, 2));
        setCompanyName(json.price.longName);

        setData(quotes.map((quote) => {
          let { date, ...other } = quote;
  
          return {
            date: DateTime.fromISO(date).toFormat('MM/dd/yy'),
            ...other
          };
        }));
      } catch(err) {
        console.log(err.message);
        alert(`${ticker} not found`);
        navigate('/');
      }
    };

    getHistoricalData();
  }, [ticker, period1, dateFormatDefault, navigate]);

  const handlePeriod1 = (event) => {
    setPeriod1(event.target.value);
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={0}>
        <Typography variant="h6" component="div">
          <Link href="/" style={{ textDecoration: 'none' }}>&gt;</Link> { ticker.toUpperCase() }
        </Typography>
        <Typography variant="subtitle1" component="div">
          { companyName }
        </Typography>
      </Stack>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="left" style={{ verticalAlign: 'top' }}>Price</TableCell>
            <TableCell align="left" style={{ verticalAlign: 'top' }}>Price ({ periodStart })</TableCell>
            <TableCell align="left" style={{ verticalAlign: 'top' }}>Performance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell align="left" style={{ verticalAlign: 'top' }}>{ formatMoney(priceEnd) }</TableCell>
            <TableCell align="left" style={{ verticalAlign: 'top' }}>{ formatMoney(priceStart) }</TableCell>
            {/* <TableCell align="left" style={{ verticalAlign: 'top' }}>{priceChange > 0 ? `+` :''}{ priceChange } { returnPct }%</TableCell> */}
            <TableCell align="left" style={{ verticalAlign: 'top' }}>{ toFixed(returnPct, 2) }%</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <ToggleButtonGroup
        color="primary"
        exclusive
        value={ period1 }
        onChange={ handlePeriod1 }
        size="small"
        fullWidth
      >
        {
          toggleButtons.map((toggleButton) => <ToggleButton key={ toggleButton.value } value={ toggleButton.value }>{ toggleButton.label }</ToggleButton>)
        }
      </ToggleButtonGroup>
      <ChartComponent
        ticker={ ticker }
        data={ data }
        priceStart={ priceStart }
        returnPct={ returnPct }
        dateFormatDefault={ dateFormatDefault }
      />
    </Stack>
  );
};

export default Chart;
