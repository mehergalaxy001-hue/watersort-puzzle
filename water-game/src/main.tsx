import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AdMobProvider } from './components/AdMobManager';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdMobProvider>
      <App />
    </AdMobProvider>
  </StrictMode>,
);
