import { useEffect, useState, } from 'react';
import { useParams } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
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
  const { ticker }  = useParams();
  const [period, setPeriod] = useState('');
  const [priceStart, setPriceStart] = useState(0);
  const [priceEnd, setPriceEnd] = useState(0);
  const [returnPct, setReturnPct] = useState(0);
  const [data, setData] = useState([]);

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
      <h3 className="text-start">{ ticker }</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th className="text-start">Start Price</th>
            <th className="text-start">End Price</th>
            <th className="text-start">Performance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-start">{ priceStart }</td>
            <td className="text-start">{ priceEnd }</td>
            <td className="text-start">{ returnPct }%</td>
          </tr>
        </tbody>
      </table>
      <ToggleButtonGroup
        color="primary"
        exclusive
        value={period}
        onChange={ handlePeriod }
        style={{ marginTop: 20 }}
      >
        <ToggleButton value="weeks">1 WEEK</ToggleButton>
        <ToggleButton value="months">1 MONTH</ToggleButton>
        <ToggleButton value="years">1 YEAR</ToggleButton>
        <ToggleButton value="">YTD</ToggleButton>
      </ToggleButtonGroup>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          // width={500}
          // height={500}
          data={data}
          margin={{
            top: 50,
            right: 0,
            left: 0,
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
              fontSize: '0.8rem',
            }}
          />
          <YAxis
            dataKey="close" 
            interval="preserveStartEnd" 
            domain={['auto', 'auto']}
            // domain={['dataMin', 'dataMax']}
            // domain={['dataMin - 10', 'dataMax + (dataMax * 0.1)']}
            // domain={['dataMin - (dataMin * 0.1)', 'dataMax + (dataMax * 0.1)']}
            // domain={[dataMin => (dataMin - (dataMin * 0.1)), dataMax => (dataMax + (dataMax * 0.1))]}
            tickMargin="10"
            style={{
              fontSize: '0.8rem',
            }}
            tickFormatter={(value) => `$${toFixed(value, 2)}`}
          />
          <Tooltip
            formatter={(value) => `$${toFixed(value, 2)} ${toFixed((value/unformat(priceStart) - 1) * 100, 2)}%`}
          />
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

export default Chart;
