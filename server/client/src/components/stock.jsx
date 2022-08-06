import { Link } from 'react-router-dom';

const Stock = ({ stock: { ticker, companyName } }) => (
  <tr>
    <td className="text-start"><Link to={`/chart/${ticker}`}>{ ticker }</Link></td>
    <td className="text-start">{ companyName }</td>
  </tr>
);

export default Stock;
