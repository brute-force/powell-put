import { Link } from '@mui/material';
import moment from 'moment';

// eslint-disable-next-line react/prop-types
const CustomizedLabel = ({ viewBox: { x, y, width, height }, value: { meetingStart, meetingEnd, ticker} }) => {
  return (
    <g>
      <Link href={ `/jerry/${ticker}?period1=${ meetingStart }&period2=${moment(meetingStart, moment.defaultFormat).add(2, 'days').format()}` }>
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
          { moment(meetingEnd).format('MM/DD') }
        </text>
      </Link>
    </g>
  );
};

export default CustomizedLabel;
