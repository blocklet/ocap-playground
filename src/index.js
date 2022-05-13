/* eslint-disable no-console */
import React from 'react';
import { createRoot } from 'react-dom/client';

// eslint-disable-next-line import/no-named-as-default
import App from './app';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
