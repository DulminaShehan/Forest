import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from '@/App';
import { ForestMonitorProvider } from '@/state/ForestMonitorContext';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ForestMonitorProvider>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={2500}
          newestOnTop
          closeOnClick
          pauseOnHover={false}
          theme="dark"
          toastClassName="!bg-midnight-800 !text-white !rounded-2xl !border !border-white/10"
        />
      </ForestMonitorProvider>
    </BrowserRouter>
  </React.StrictMode>
);