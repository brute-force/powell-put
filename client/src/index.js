import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './css/index.css';
import { ChartProvider } from './contexts/ChartContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <BrowserRouter>
    <ChartProvider>
      <App />
    </ChartProvider>
  </BrowserRouter>
  // </React.StrictMode>
);
