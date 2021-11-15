import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import axios from 'axios'

const host = window.location.host
const baseURL = `https://${host}`
axios.defaults.baseURL = baseURL
console.log(baseURL)
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
