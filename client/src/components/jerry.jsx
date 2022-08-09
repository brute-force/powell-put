import {
  Link, Stack, Table, TableBody, TableCell, TableHead, TableRow, ToggleButton,
  ToggleButtonGroup, Typography, Popover
} from '@mui/material';
import { formatMoney, toFixed } from 'accounting';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ChartComponent from './ChartComponent';
import fomcMeetings from './fomc';

const defaultDateFormat = 'MM/dd/yy';
const now = DateTime.now();

const Jerry = () => {
  const { ticker }  = useParams();
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

  const toggleButtons = [
    {
      label: '1 D AFTER',
      value: DateTime.fromFormat(searchParams.get('period1'), defaultDateFormat).plus({ days: 2 }).toFormat(defaultDateFormat)
    },
    {
      label: '1 W AFTER',
      value: DateTime.fromFormat(searchParams.get('period1'), defaultDateFormat).plus({ weeks: 1 }).toFormat(defaultDateFormat)
    },
    {
      label: '1 M AFTER',
      value: DateTime.fromFormat(searchParams.get('period1'), defaultDateFormat).plus({ months: 1 }).toFormat(defaultDateFormat)
    },
    {
      label: 'TODAY',
      value: now.toFormat(defaultDateFormat)
    }
  ];
  
  // console.log(`loading data: ${ticker}`);

  useEffect(() => {
    const getHistoricalData = async () => {
      try {
        let feed = process.env.NODE_ENV !== 'production'
          ? `http://192.168.1.62:${process.env.REACT_APP_API_PORT}/historical`
          : '/historical';
        
        const response = await fetch(`${feed}?ticker=${ticker}&period1=${searchParams.get('period1')}&period2=${searchParams.get('period2')}`);

        const json = await response.json();
        const quotes = json.quotes;
        const quoteStart = quotes[0];
        const quoteEnd = quotes[quotes.length - 1];
  
        setPriceStart(quoteStart.close);
        setPriceEnd(quoteEnd.close);
        setReturnPct((quoteEnd.close/quoteStart.close - 1) * 100);
        // actual periods are interpolated to closest tradings days
        setPeriodStart(DateTime.fromISO(quoteStart.date).toFormat(defaultDateFormat));
        setPeriodEnd(DateTime.fromISO(quoteEnd.date).toFormat(defaultDateFormat));
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
        alert(err.message);
      }
    };

    getHistoricalData();
  }, [ticker, searchParams, periodStart, periodEnd]);

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

  const open = Boolean(fomcNotesPopoverAnchorEl);
  const id = open ? 'simple-popover' : undefined;

  // let meeting = fomcMeetings.find((meeting) => DateTime.fromFormat(meeting.meetingStart, defaultDateFormat).hasSame(DateTime.fromFormat(periodStart, defaultDateFormat), 'day'));
  let meeting = fomcMeetings.find((meeting) => meeting.meetingStart === periodStart);
  let meetingInfo = meeting
    ? <Stack spacing={0} style={{ marginTop: 5, marginBottom: 0 }}>
      <Typography variant="subtitle2" component="div" onClick={ handleFomcNotesPopoverClick }>
        FOMC Meeting { meeting.meetingStart } - { meeting.meetingEnd }
      </Typography>
      <Popover
        id={ id }
        open={ open }
        anchorEl={ fomcNotesPopoverAnchorEl }
        onClose={ handleFomcNotesPopoverClose }
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Typography sx={{ p: 2 }}>Notes: { meeting.notes}</Typography>
      </Popover>
    </Stack>
    : '';

  return (
    <Stack spacing={4}>
      <Stack spacing={0}>
        <Typography variant="h6" component="div">
          <Link href="/" style={{ textDecoration: 'none' }}>&gt;</Link> 
          <Link href={ `/chart/${ticker}` } style={{ textDecoration: 'none' }}>
            &nbsp;{ ticker.toUpperCase() }
          </Link>
        </Typography>
        <Typography variant="subtitle1" component="div">
          { companyName }
        </Typography>
      </Stack>
      { meetingInfo }
      <Table size="small" style={{ marginTop: 10, marginBottom: 0 }}>
        <TableHead>
          <TableRow>
            <TableCell align="left" style={{ verticalAlign: 'top' }}>Price ({ periodEnd })</TableCell>
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
        value={ searchParams.get('period2') }
        onChange={ handlePeriod2 }
        size="small"
        fullWidth
      >
        {
          toggleButtons.map((toggleButton) => {
            return DateTime.fromFormat(toggleButton.value, defaultDateFormat) < now
              ? (
                <ToggleButton key={ toggleButton.value } value={ toggleButton.value }>{ toggleButton.label }</ToggleButton>
              )
              : '';
          })
        }
      </ToggleButtonGroup>
      <ChartComponent
        ticker={ ticker }
        data={ data }
        priceStart={ priceStart }
        returnPct={ returnPct }
        defaultDateFormat={ defaultDateFormat }
      />
    </Stack>
  );
};

export default Jerry;
