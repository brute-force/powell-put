import PropTypes from 'prop-types';
import { createContext, useState } from 'react';
import FOMC_MEETINGS from '../components/fomc';

export const ChartContext = createContext({
  dateFormatDefault: '',
  dateFormatShort: '',
  fomcMeetings: []
});

export const ChartProvider = ({ children }) => {
  const [dateFormatDefault] = useState('MM/dd/yy');
  const [dateFormatShort] = useState('MM/dd');
  const [fomcMeetings] = useState(FOMC_MEETINGS);

  const value = { dateFormatDefault, dateFormatShort, fomcMeetings };

  return <ChartContext.Provider value={value}>{children}</ChartContext.Provider>;
};

ChartProvider.propTypes = {
  children: PropTypes.object.isRequired,
};
