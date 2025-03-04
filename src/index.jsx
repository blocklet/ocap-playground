/* eslint-disable no-console */
import { createRoot } from 'react-dom/client';

// eslint-disable-next-line import/no-named-as-default
import App from './app';

const container = document.getElementById('app');
const root = createRoot(container);

root.render(<App />);
