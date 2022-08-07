import { Routes, Route } from 'react-router-dom';
import Stocks from './components/stocks';
import Chart from './components/chart';
import { Container } from '@mui/material';

function App() {
  return (
    <div className="App">
      <Container maxWidth="lg" sx={{ mt: 2}}>
        <Routes>
          <Route exact path="/" element={<Stocks />} />
          <Route exact path="/chart/:ticker" element={<Chart />} />
        </Routes>
      </Container>
    </div>
  );
}

export default App;
