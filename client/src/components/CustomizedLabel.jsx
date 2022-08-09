import PropTypes from 'prop-types';
import { Link } from '@mui/material';

const CustomizedLabel = ({ viewBox: { x, y, width, height }, value: { meetingStart, meetingEndTrimmed, period2, ticker} }) => {
  return (
    <g>
      <Link href={ `/jerry/${ticker}?period1=${ meetingStart }&period2=${period2}` }>
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
          { meetingEndTrimmed }
        </text>
      </Link>
    </g>
  );
};

CustomizedLabel.propTypes = {
  viewBox: PropTypes.exact({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
  }),
  value: PropTypes.exact({
    meetingStart: PropTypes.string.isRequired,
    meetingEndTrimmed: PropTypes.string.isRequired,
    period2: PropTypes.string.isRequired,
    ticker: PropTypes.string.isRequired
  }),
};


export default CustomizedLabel;

