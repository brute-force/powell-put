import PropTypes from 'prop-types';
import { useContext } from 'react';
import { DateTime } from 'luxon';
import { Link } from '@mui/material';
import { ChartContext } from '../contexts/ChartContext';

function CustomizedLabel({ viewBox: { x, y }, value: { meetingStart, meetingEnd, ticker } }) {
  const { dateFormatDefault, dateFormatShort } = useContext(ChartContext);

  const dtMeetingStart = DateTime.fromFormat(meetingStart, dateFormatDefault);
  const dtMeetingEnd = DateTime.fromFormat(meetingEnd, dateFormatDefault);
  const meetingEndTrimmed = dtMeetingEnd.toFormat(dateFormatShort);
  const period2 = dtMeetingStart.plus({ days: 2 }).toFormat(dateFormatDefault);

  return (
    <g>
      <Link href={`/jerry/${ticker}?period1=${meetingStart}&period2=${period2}`}>
        <text
          x={x}
          y={y}
          fill="#111"
          dy={-20}
          dx={-20}
          textAnchor="start"
          transform={`rotate(-30,${x},${y})`}
          style={{ fontSize: '0.8rem' }}
        >
          {meetingEndTrimmed}
        </text>
      </Link>
    </g>
  );
}

CustomizedLabel.propTypes = {
  viewBox: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }),
  value: PropTypes.shape({
    meetingStart: PropTypes.string.isRequired,
    meetingEnd: PropTypes.string.isRequired,
    ticker: PropTypes.string.isRequired
  }).isRequired
};

CustomizedLabel.defaultProps = {
  viewBox: {
    x: 0,
    y: 0
  }
};

export default CustomizedLabel;
