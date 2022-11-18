import { Container } from '@mui/material';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Spinner from './components/Spinner';

const Home = lazy(() => import('./components/Home'));
const Chart = lazy(() => import('./components/chart'));
const Jerry = lazy(() => import('./components/jerry'));

function App() {
  return (
    <div className="App">
      <Container maxWidth="lg" sx={{ mt: 2 }}>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/chart/:ticker" element={<Chart />} />
            <Route exact path="/jerry/:ticker" element={<Jerry />} />
          </Routes>
        </Suspense>
      </Container>
    </div>
  );
}

export default App;
