import React from 'react';  
import ReactDOM from 'react-dom/client';  
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom';  
import './styles/App.css';  
import App from './app';

// Create root element for React 18  
const root = ReactDOM.createRoot(document.getElementById('root'));  

// Render app wrapped in BrowserRouter for routing  
root.render(  
  <React.StrictMode>  
    <BrowserRouter>  
      <App />  
    </BrowserRouter>  
  </React.StrictMode>  
);