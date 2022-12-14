import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ChartProvider } from './contexts/ChartContext';
import './css/index.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

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

serviceWorkerRegistration.register();
