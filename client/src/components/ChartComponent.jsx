import { toFixed } from 'accounting';
import { DateTime } from 'luxon';
import PropTypes from 'prop-types';
import {
  Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import CustomizedLabel from './CustomizedLabel';
import fomcMeetings from './fomc';

const ChartComponent = ({ ticker, data, priceStart, returnPct, defaultDateFormat}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        // width={500}
        // height={500}
        data={ data }
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
          formatter={(value) => `$${toFixed(value, 2)} ${toFixed(value - priceStart, 2) > 0 ? `+${toFixed(value - priceStart, 2)}` : toFixed(value - priceStart, 2)} (${toFixed((value/priceStart - 1) * 100, 2)}%)`}
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
  );
};

ChartComponent.propTypes = {
  ticker: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  priceStart: PropTypes.number.isRequired,
  returnPct: PropTypes.number.isRequired,
  defaultDateFormat: PropTypes.string.isRequired
};

export default ChartComponent;