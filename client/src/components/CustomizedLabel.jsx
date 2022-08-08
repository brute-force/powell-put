import { Link } from '@mui/material';

// eslint-disable-next-line react/prop-types
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

export default CustomizedLabel;
// 
