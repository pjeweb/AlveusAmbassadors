import React from 'react';
import ReactDOM from 'react-dom/client';

import {subscribeToChannelUpdate} from "../../utils/twitch-api";
import App from './App';

import './index.css';

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)

subscribeToChannelUpdate();

root.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);