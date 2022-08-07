import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  ToggleButton, 
  ToggleButtonGroup
} from '@mui/material';
import { formatMoney, toFixed, unformat } from 'accounting';
import moment from 'moment';

// moment.defaultFormat = 'YYYY-MM-DD';
moment.defaultFormat = 'MM/DD/YY';

const Chart = () => {
  const fomcMeetings = [
    {
      id: 1,
      meetingStart: '01/25/22',
      meetingEnd: '01/26/22'
    },
    {
      id: 2,
      meetingStart: '03/15/22',
      meetingEnd: '03/16/22'
    },
    {
      id: 3,
      meetingStart: '05/03/22',
      meetingEnd: '05/04/22'
    },
    {
      id: 4,
      meetingStart: '06/14/22',
      meetingEnd: '06/15/22'
    },
    {
      id: 5,
      meetingStart: '07/26/22',
      meetingEnd: '07/27/22'
    },
  ];

  const { ticker }  = useParams();
  const [period, setPeriod] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [priceStart, setPriceStart] = useState(0);
  const [priceEnd, setPriceEnd] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
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

        const response = await fetch(`${feed}?ticker=${ticker}&period=${period}`);
 
        const json = await response.json();
        const quotes = json.quotes;
        const quoteStart = quotes[0];
        const quoteEnd = quotes[quotes.length - 1];
  
        setPriceStart(formatMoney(quoteStart.close));
        setPriceEnd(formatMoney(quoteEnd.close));
        setReturnPct(toFixed((quoteEnd.close/quoteStart.close - 1) * 100, 2));
        setPeriodStart(moment(quoteStart.date).format());
        setPriceChange(toFixed(quoteEnd.close - quoteStart.close, 2));
        setCompanyName(json.price.longName);
  
        setData(quotes.map((quote) => {
          let { date, ...other } = quote;
  
          return {
            date: moment(date).format(),
            // date: moment.utc(date).valueOf(),
            ...other
          };
  
        }));
        // setData(quotes.map((quote) => ({ date: moment(quote.date).format(), ...rest}));
      } catch(err) {
        console.log(err.message);
        alert(err.message);
      }
    };

    getHistoricalData();
  }, [ticker, period]);

  const handlePeriod = (event, period) => {
    setPeriod(period);
  };

  return (
    <div style={{ marginLeft: 20, marginRight: 20, marginTop: 20 }}>
      <h3 className="text-start">{ companyName }</h3>
      <h4 className="text-start">{ ticker }</h4>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th className="text-start" valign="top">Price ({ periodStart })</th>
            <th className="text-start" valign="top">Price (close)</th>
            <th className="text-start" valign="top">Performance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-start">{ priceStart }</td>
            <td className="text-start">{ priceEnd }</td>
            <td className="text-start">{ priceChange > 0 ? `+${priceChange}`: priceChange } ({ returnPct }%)</td>
          </tr>
        </tbody>
      </table>
      <ToggleButtonGroup
        color="primary"
        exclusive
        value={period}
        onChange={ handlePeriod }
        style={{ marginTop: 50 }}
        fullWidth
      >
        <ToggleButton value="weeks">1 W</ToggleButton>
        <ToggleButton value="months">1 M</ToggleButton>
        <ToggleButton value="years">1 Y</ToggleButton>
        <ToggleButton value="">YTD</ToggleButton>
      </ToggleButtonGroup>
      <ResponsiveContainer width="100%" height={375}>
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
            fomcMeetings.map(({ id, meetingEnd}) => {
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
                    label={ <CustomizedLabel value={`${mMeetingEnd.format('MM/DD')}`} /> }
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
    </div>
  );
};

// eslint-disable-next-line react/prop-types
const _CustomizedLabel = ({ value, viewBox: { x, y} }) => (
  <g>
    <foreignObject x={x-35} y={y-40} width={70} height={50}>
      <div align="center" style={{ fontSize: '0.8rem' }}>
        { value }
      </div>
    </foreignObject>
  </g>
);

// eslint-disable-next-line react/prop-types
const CustomizedLabel = ({ viewBox: { x, y, width, height }, value }) => {
  return (
    <g>
      <text
        x={ x }
        y={ y }
        fill="#111"
        dy={ -20 }
        dx={ -20 }
        textAnchor="start"
        transform={`rotate(-30,${x},${y})`}
        style={{ fontSize: '0.8rem' }}
      >
        { value }
      </text>
    </g>
  );
};

export default Chart;
