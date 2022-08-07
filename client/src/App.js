import { Routes, Route } from 'react-router-dom';
import Stocks from './components/stocks';
import Chart from './components/chart';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<Stocks />} />
        <Route exact path="/chart/:ticker" element={<Chart />} />
      </Routes>
    </div>
  );
}

export default App;
