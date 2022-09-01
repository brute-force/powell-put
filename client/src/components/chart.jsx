import {
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { formatMoney, toFixed } from 'accounting';
import { DateTime } from 'luxon';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChartContext } from '../contexts/ChartContext';
import AlertSnackbar from './AlertSnackbar';
import ChartComponent from './ChartComponent';

const now = DateTime.now();

function Chart() {
  const { dateFormatDefault } = useContext(ChartContext);
  // const navigate = useNavigate();

  const { ticker } = useParams();
  const [period1, setPeriod1] = useState(now.startOf('year').toFormat(dateFormatDefault));
  const [periodStart, setPeriodStart] = useState('');
  const [priceStart, setPriceStart] = useState(0);
  const [priceEnd, setPriceEnd] = useState(0);
  const [returnPct, setReturnPct] = useState(0);
  const [data, setData] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');
  const [open, setOpen] = useState(false);

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
      label: '2 Y',
      value: now.minus({ years: 2 }).toFormat(dateFormatDefault)
    },
    {
      label: 'YTD',
      value: now.startOf('year').toFormat(dateFormatDefault)
    }
  ];

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const feed =
      process.env.NODE_ENV !== 'production'
        ? `http://192.168.1.62:${process.env.REACT_APP_API_PORT}/historical`
        : '/historical';

    fetch(`${feed}?ticker=${ticker}&period1=${period1}`, { signal })
      .then(async (res) => {
        const json = await res.json();

        if (!res.ok) {
          throw new Error(`${json.message}`);
        }

        return json;
      })
      // .then((res) => res.json())
      .then((json) => {
        const { quotes, price } = json;
        const quoteStart = quotes[0];
        const quoteEnd = quotes[quotes.length - 1];

        setPriceStart(quoteStart.close);
        setPriceEnd(quoteEnd.close);
        setReturnPct((quoteEnd.close / quoteStart.close - 1) * 100);
        // actual periods are interpolated to closest tradings days
        setPeriodStart(DateTime.fromISO(quoteStart.date).toFormat(dateFormatDefault));
        // setPriceChange(toFixed(quoteEnd.close - quoteStart.close, 2));
        setCompanyName(price.longName);

        setData(
          quotes.map((quote) => {
            const { date, ...other } = quote;

            return {
              date: DateTime.fromISO(date).toFormat('MM/dd/yy'),
              ...other
            };
          })
        );
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        if (err.name === 'AbortError') console.error(err.message);

        setMessage(err.message);
        setSeverity('error');
        setOpen(true);

        // navigate('/');
      });

    return () => {
      // console.log('aborting...');
      abortController.abort();
    };
  }, [period1]);

  const handlePeriod1 = (event) => {
    setPeriod1(event.target.value);
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={0}>
        <Typography variant="h6" component="div">
          <Link href="/" style={{ textDecoration: 'none' }}>
            &gt;&nbsp;
          </Link>
          {ticker.toUpperCase()}
        </Typography>
        <Typography variant="subtitle1" component="div">
          {companyName}
        </Typography>
      </Stack>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="left" style={{ verticalAlign: 'top' }}>
              Price
            </TableCell>
            <TableCell align="left" style={{ verticalAlign: 'top' }}>
              {`Price (${periodStart})`}
            </TableCell>
            <TableCell align="left" style={{ verticalAlign: 'top' }}>
              Performance
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell align="left" style={{ verticalAlign: 'top' }}>
              {formatMoney(priceEnd)}
            </TableCell>
            <TableCell align="left" style={{ verticalAlign: 'top' }}>
              {formatMoney(priceStart)}
            </TableCell>
            <TableCell align="left" style={{ verticalAlign: 'top' }}>
              {`${toFixed(returnPct, 2)}%`}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <ToggleButtonGroup color="primary" exclusive value={period1} onChange={handlePeriod1} size="small" fullWidth>
        {toggleButtons.map(({ label, value }) => (
          <ToggleButton key={value} value={value}>
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <ChartComponent ticker={ticker} data={data} priceStart={priceStart} returnPct={returnPct} />
      <AlertSnackbar message={message} open={open} setOpen={setOpen} severity={severity} />
    </Stack>
  );
}

export default Chart;
