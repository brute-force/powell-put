import { toFixed } from 'accounting';
import { DateTime } from 'luxon';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContext } from '../contexts/ChartContext';
import CustomizedLabel from './CustomizedLabel';

function ChartComponent({ ticker, data, priceStart, returnPct }) {
  const { dateFormatDefault, fomcMeetings } = useContext(ChartContext);

  const tooltipFormatter = (value) => {
    let tooltipValue = toFixed(value - priceStart, 2);

    if (tooltipValue > 0) {
      tooltipValue = `+${tooltipValue}`;
    }

    return `$${toFixed(value, 2)} ${tooltipValue} (${toFixed((value / priceStart - 1) * 100, 2)}%)`;
  };

  return (
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
            <stop offset="5%" stopColor="#CC0000" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#CC0000" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#66CC00" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#66CC00" stopOpacity={0.1} />
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
          domain={[(dataMin) => dataMin * 0.88, (dataMax) => Math.ceil(dataMax)]}
          tickMargin="10"
          style={{
            fontSize: '0.8rem'
          }}
          tickFormatter={(value) => `$${toFixed(value, 2)}`}
        />
        <Tooltip formatter={tooltipFormatter} />
        {fomcMeetings.map(({ id, meetingStart, meetingEnd }) => {
          const dtMeetingEnd = DateTime.fromFormat(meetingEnd, dateFormatDefault);
          const dtMeetingStart = DateTime.fromFormat(meetingStart, dateFormatDefault);

          return dtMeetingEnd > dtMeetingStart && dtMeetingEnd < DateTime.now() ? (
            <ReferenceLine
              key={id}
              x={meetingEnd}
              stroke="green"
              strokeDasharray="3 3"
              label={<CustomizedLabel value={{ meetingStart, meetingEnd, ticker }} />}
            />
          ) : (
            ''
          );
        })}
        <Area
          type="monotone"
          dataKey="close"
          stroke="{ returnPct < 0 ? '#CC0000' : '#66CC00' }"
          fill={returnPct < 0 ? 'url(#colorRed)' : 'url(#colorGreen)'}
          fillOpacity={1}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

ChartComponent.propTypes = {
  ticker: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      high: PropTypes.number.isRequired,
      volume: PropTypes.number.isRequired,
      open: PropTypes.number.isRequired,
      low: PropTypes.number.isRequired,
      close: PropTypes.number.isRequired,
      adjclose: PropTypes.number.isRequired
    })
  ).isRequired,
  priceStart: PropTypes.number.isRequired,
  returnPct: PropTypes.number.isRequired
};

export default ChartComponent;
