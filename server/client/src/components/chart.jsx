import React from 'react';
import { useEffect, useState, } from 'react';
import { useParams } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { 
  // FormControl, 
  // FormLabel, 
  // FormControlLabel, 
  // Radio, 
  // RadioGroup,
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
    // console.log('useEffect');

    const getHistoricalData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/historical?ticker=${ticker}&period=${period}`);
 
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

      {/* <FormControl>
        <FormLabel id="demo-radio-buttons-group-label">PERIOD</FormLabel>
        <RadioGroup
          row
          aria-labelledby="demo-radio-buttons-group-label"
          // defaultValue="1"
          onChange={ handlePeriod }
          name="radio-buttons-group"
        >
          <FormControlLabel value="weeks" control={<Radio />} label="1 WEEK" />
          <FormControlLabel value="months" control={<Radio />} label="1 MONTH" />
          <FormControlLabel value="years" control={<Radio />} label="1 YEAR" />
        </RadioGroup>
      </FormControl> */}
      <AreaChart
        width={500}
        height={400}
        data={data}
        margin={{
          top: 50,
          right: 20,
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
            fontSize: '0.8rem',
          }}
        />
        <YAxis
          dataKey="close" 
          interval="preserveStartEnd" 
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
      
      {/* <span onClick={ handlePeriod } value="weeks">1W</span>
      <br />
      <span onClick={ handlePeriod } value="months">1M</span>
      <br />
      <span onClick={ handlePeriod } value="years">1Y</span> */}
    </div>
  );
};

export default Chart;
