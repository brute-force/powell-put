import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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
import moment from 'moment';
import fomcMeetings from './fomc';
import CustomizedLabel from './CustomizedLabel';

moment.defaultFormat = 'MM/DD/YY';
const now = moment();

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

  const toggleButtons = [
    {
      label: '1 D AFTER',
      value: moment(searchParams.get('period1'), moment.defaultFormat).add(2, 'days').format()
    },
    {
      label: '1 W AFTER',
      value: moment(searchParams.get('period1'), moment.defaultFormat).add(1, 'weeks').format()
    },
    {
      label: '1 M AFTER',
      value: moment(searchParams.get('period1'), moment.defaultFormat).add(1, 'months').format()
    },
    {
      label: 'TODAY',
      value: now.format()
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
  
        setPriceStart(formatMoney(quoteStart.close));
        setPriceEnd(formatMoney(quoteEnd.close));
        setReturnPct(toFixed((quoteEnd.close/quoteStart.close - 1) * 100, 2));
        // actual periods are interpolated to closest tradings days
        setPeriodStart(moment(quoteStart.date).format()); 
        setPeriodEnd(moment(quoteEnd.date).format());
        // setPriceChange(toFixed(quoteEnd.close - quoteStart.close, 2));
        setCompanyName(json.price.longName);
  
        setData(quotes.map((quote) => {
          let { date, ...other } = quote;
  
          return {
            date: moment(date).format(),
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

  let meeting = fomcMeetings.find((meeting) => moment(meeting.meetingStart, moment.defaultFormat).isSame(moment(periodStart, moment.defaultFormat)));
  let meetingInfo = meeting
    ? <Stack spacing={0} style={{ marginTop: 10, marginBottom: 0 }}>
      <Typography variant="subtitle2" component="div">
        FOMC Meeting { meeting.meetingStart } - { meeting.meetingEnd }
      </Typography>
      <Typography variant="subtitle3" component="div">
        Notes: { meeting.notes }
      </Typography>
    </Stack>
    : '';

  return (
    <Stack spacing={4}>
      <Stack spacing={0}>
        <Typography variant="h6" component="div">
          <Link href={ `/chart/${ticker}` } style={{ textDecoration: 'none' }}>
            { ticker.toUpperCase() }
          </Link>
        </Typography>
        <Typography variant="subtitle1" component="div">
          { companyName }
        </Typography>
      </Stack>
      { meetingInfo }
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="left" style={{ verticalAlign: 'top' }}>Price ({ periodEnd })</TableCell>
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
        value={ searchParams.get('period2') }
        onChange={ handlePeriod2 }
        size="small"
        fullWidth
      >
        {
          toggleButtons.map((toggleButton) => {
            return moment(toggleButton.value, moment.defaultFormat).isBefore(now)
              ? (
                <ToggleButton key={ toggleButton.value } value={ toggleButton.value }>{ toggleButton.label }</ToggleButton>
              )
              : '';
          })
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
            // fomcMeetings.map((meeting) => <ReferenceLine key={ meeting.id } x={ meeting.meetingEnd } stroke="green" strokeDasharray="3 3" />)
            fomcMeetings.map(({ id, meetingStart, meetingEnd}) => {
              const mMeetingEnd = moment(meetingEnd, moment.defaultFormat);
              const mPeriodStart = moment(periodStart, moment.defaultFormat);
              
              if (mMeetingEnd.isAfter(mPeriodStart) && mMeetingEnd.isBefore(moment())) {
                return (
                  <ReferenceLine 
                    key={ id }
                    x={ meetingEnd }
                    stroke="green"
                    strokeDasharray="3 3"
                    // label={{ value: `${moment(meetingEnd).format('MM/DD')}`, position: 'top', fontSize: 15, angle:"-45" }}
                    // label={ <CustomizedLabel value={`${mMeetingEnd.format('MM/DD')}`} /> }
                    label={ <CustomizedLabel value={ { meetingStart, meetingEnd, ticker } } /> }
                  />
                );
              } else {
                return '';
              }
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

export default Jerry;
