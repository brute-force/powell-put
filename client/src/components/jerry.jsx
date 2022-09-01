import {
  Link,
  Popover,
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
import { useParams, useSearchParams } from 'react-router-dom';
import { ChartContext } from '../contexts/ChartContext';
import ChartComponent from './ChartComponent';
import AlertSnackbar from './AlertSnackbar';

const now = DateTime.now();

function Jerry() {
  const { ticker } = useParams();
  const { dateFormatDefault, fomcMeetings } = useContext(ChartContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [priceStart, setPriceStart] = useState(0);
  const [priceEnd, setPriceEnd] = useState(0);
  // const [priceChange, setPriceChange] = useState(0);
  const [returnPct, setReturnPct] = useState(0);
  const [data, setData] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [fomcNotesPopoverAnchorEl, setFomcNotesPopoverAnchorEl] = useState(null);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');
  const [open, setOpen] = useState(false);

  const toggleButtons = [
    {
      label: '1 D AFTER',
      value: DateTime.fromFormat(searchParams.get('period1'), dateFormatDefault)
        .plus({ days: 2 })
        .toFormat(dateFormatDefault)
    },
    {
      label: '1 W AFTER',
      value: DateTime.fromFormat(searchParams.get('period1'), dateFormatDefault)
        .plus({ weeks: 1 })
        .toFormat(dateFormatDefault)
    },
    {
      label: '1 M AFTER',
      value: DateTime.fromFormat(searchParams.get('period1'), dateFormatDefault)
        .plus({ months: 1 })
        .toFormat(dateFormatDefault)
    },
    {
      label: 'CLOSE',
      value: now.toFormat(dateFormatDefault)
    }
  ];

  // console.log(`loading data: ${ticker}`);

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const feed =
      process.env.NODE_ENV !== 'production'
        ? `http://192.168.1.62:${process.env.REACT_APP_API_PORT}/historical`
        : '/historical';

    fetch(`${feed}?ticker=${ticker}&period1=${searchParams.get('period1')}&period2=${searchParams.get('period2')}`, {
      signal
    })
      .then(async (res) => {
        const json = await res.json();

        if (!res.ok) {
          throw new Error(`${json.message}`);
        }

        return json;
      })
      // .then((res) => res.json())
      .then((json) => {
        const { quotes } = json;
        const quoteStart = quotes[0];
        const quoteEnd = quotes[quotes.length - 1];

        setPriceStart(quoteStart.close);
        setPriceEnd(quoteEnd.close);
        setReturnPct((quoteEnd.close / quoteStart.close - 1) * 100);
        // actual periods are interpolated to closest tradings days
        setPeriodStart(DateTime.fromISO(quoteStart.date).toFormat(dateFormatDefault));
        setPeriodEnd(DateTime.fromISO(quoteEnd.date).toFormat(dateFormatDefault));
        // setPriceChange(toFixed(quoteEnd.close - quoteStart.close, 2));
        setCompanyName(json.price.longName);

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
      });

    return () => {
      // console.log('aborting...');
      abortController.abort();
    };
  }, [searchParams]);

  const handlePeriod2 = (event) => {
    searchParams.set('period2', event.target.value);
    setSearchParams(searchParams);
  };

  const handleFomcNotesPopoverClick = (event) => {
    setFomcNotesPopoverAnchorEl(event.currentTarget);
  };

  const handleFomcNotesPopoverClose = () => {
    setFomcNotesPopoverAnchorEl(null);
  };

  const openPopover = Boolean(fomcNotesPopoverAnchorEl);
  const id = openPopover ? 'simple-popover' : undefined;

  const meeting = fomcMeetings.find((fomcMeeting) => fomcMeeting.meetingStart === periodStart);

  return (
    <Stack spacing={4}>
      <Stack spacing={0}>
        <Typography variant="h6" component="div">
          <Link href="/" style={{ textDecoration: 'none' }}>
            &gt;&nbsp;
          </Link>
          <Link href={`/chart/${ticker}`} style={{ textDecoration: 'none' }}>
            {ticker.toUpperCase()}
          </Link>
        </Typography>
        <Typography variant="subtitle1" component="div">
          {companyName}
        </Typography>
      </Stack>
      {meeting && (
        <Stack spacing={0} style={{ marginTop: 5, marginBottom: 0 }}>
          <Typography variant="subtitle2" component="div" onClick={handleFomcNotesPopoverClick}>
            {`FOMC Meeting ${meeting.meetingStart} - ${meeting.meetingEnd}`}
          </Typography>
          <Popover
            id={id}
            open={openPopover}
            anchorEl={fomcNotesPopoverAnchorEl}
            onClose={handleFomcNotesPopoverClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left'
            }}
          >
            <Typography sx={{ p: 2 }}>{`Notes: ${meeting.notes}`}</Typography>
          </Popover>
        </Stack>
      )}
      <Table size="small" style={{ marginTop: 10, marginBottom: 0 }}>
        <TableHead>
          <TableRow>
            <TableCell align="left" style={{ verticalAlign: 'top' }}>{`Price (${periodEnd})`}</TableCell>
            <TableCell align="left" style={{ verticalAlign: 'top' }}>{`Price (${periodStart})`}</TableCell>
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
            <TableCell align="left" style={{ verticalAlign: 'top' }}>{`${toFixed(returnPct, 2)}%`}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <ToggleButtonGroup
        color="primary"
        exclusive
        value={searchParams.get('period2')}
        onChange={handlePeriod2}
        size="small"
        fullWidth
      >
        {toggleButtons
          .filter(({ value }) => DateTime.fromFormat(value, dateFormatDefault) < now)
          .map(({ label, value }) => (
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

export default Jerry;
