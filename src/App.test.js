import React from 'react';
import ReactDOM from 'react-dom';
// eslint-disable-next-line import/no-named-as-default
import App from './app';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
