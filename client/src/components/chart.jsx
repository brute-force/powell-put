import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { 
  Stack,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  ToggleButton, 
  ToggleButtonGroup,
  Link
} from '@mui/material';
import { formatMoney, toFixed, unformat } from 'accounting';
import fomcMeetings from './fomc';
import CustomizedLabel from './CustomizedLabel';
import { DateTime } from 'luxon';

const defaultDateFormat = 'MM/dd/yy';
const now = DateTime.now();

const toggleButtons = [
  {
    label: '1 W',
    value: now.minus({ weeks: 1 }).toFormat(defaultDateFormat)
  },
  {
    label: '1 M',
    value: now.minus({ months: 1 }).toFormat(defaultDateFormat)
  },
  {
    label: '1 Y',
    value: now.minus({ years: 1 }).toFormat(defaultDateFormat)
  },
  {
    label: 'YTD',
    value: now.startOf('year').toFormat(defaultDateFormat)
  }
];

const Chart = () => {
  const navigate = useNavigate();

  const { ticker }  = useParams();
  const [period1, setPeriod1] = useState(now.startOf('year').toFormat(defaultDateFormat));
  const [periodStart, setPeriodStart] = useState('');
  const [priceStart, setPriceStart] = useState(0);
  const [priceEnd, setPriceEnd] = useState(0);
  const [returnPct, setReturnPct] = useState(0);
  const [data, setData] = useState([]);
  const [companyName, setCompanyName] = useState('');

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

        setPriceStart(formatMoney(quoteStart.close));
        setPriceEnd(formatMoney(quoteEnd.close));
        setReturnPct(toFixed((quoteEnd.close/quoteStart.close - 1) * 100, 2));
        // actual periods are interpolated to closest tradings days
        setPeriodStart(DateTime.fromISO(quoteStart.date).toFormat(defaultDateFormat));
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
  }, [ticker, period1, navigate]);

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
            <TableCell align="left" style={{ verticalAlign: 'top' }}>{ priceEnd }</TableCell>
            <TableCell align="left" style={{ verticalAlign: 'top' }}>{ priceStart }</TableCell>
            {/* <TableCell align="left" style={{ verticalAlign: 'top' }}>{priceChange > 0 ? `+` :''}{ priceChange } { returnPct }%</TableCell> */}
            <TableCell align="left" style={{ verticalAlign: 'top' }}>{ returnPct }%</TableCell>
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
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          // width={500}
          // height={500}
          data={data}
          margin={{
            top: 50,
            right: 5,
            left: 10,
            bottom: 0
          }}
        >
          <defs>
            <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#CC0000" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#CC0000" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#66CC00" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#66CC00" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            interval="preserveStartEnd" 
            tickMargin="10"
            style={{
              fontSize: '0.8rem'
            }}
          />
          <YAxis
            dataKey="close" 
            interval="preserveStartEnd" 
            // domain={['auto', 'auto']}
            domain={[dataMin => (dataMin * 0.88), dataMax => (Math.ceil(dataMax))]}
            tickMargin="10"
            style={{
              fontSize: '0.8rem'
            }}
            tickFormatter={(value) => `$${toFixed(value, 2)}`}
          />
          <Tooltip
            formatter={(value) => `$${toFixed(value, 2)} ${toFixed(value - unformat(priceStart), 2) > 0 ? `+${toFixed(value - unformat(priceStart), 2)}` : toFixed(value - unformat(priceStart), 2)} (${toFixed((value/unformat(priceStart) - 1) * 100, 2)}%)`}
          />
          {
            fomcMeetings.map(({ id, meetingStart, meetingEnd}) => {
              const dtMeetingEnd = DateTime.fromFormat(meetingEnd, defaultDateFormat);
              const dtMeetingStart = DateTime.fromFormat(meetingStart, defaultDateFormat);
              // default end period for fed chart is 2 days after meeting start
              const meetingEndTrimmed = dtMeetingEnd.toFormat('MM/dd');
              const period2 = dtMeetingStart.plus({ days: 2 }).toFormat(defaultDateFormat);

              return dtMeetingEnd > dtMeetingStart && dtMeetingEnd < DateTime.now()
                ? (
                  <ReferenceLine 
                    key={ id }
                    x={ meetingEnd }
                    stroke="green"
                    strokeDasharray="3 3"
                    // label={{ value: `${moment(meetingEnd).format('MM/DD')}`, position: 'top', fontSize: 15, angle:"-45" }}
                    label={ <CustomizedLabel value={ { meetingStart, meetingEndTrimmed, period2, ticker } } /> }
                  />
                )
                : '';
            })
          }
          <Area
            type="monotone"
            dataKey="close"
            stroke="{ returnPct < 0 ? '#CC0000' : '#66CC00' }"
            fill={ returnPct < 0 ? 'url(#colorRed)' : 'url(#colorGreen)' } 
            fillOpacity={1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Stack>
  );
};

export default Chart;
