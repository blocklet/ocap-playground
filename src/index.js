import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorkerRegistration from './service-worker-registration';
// eslint-disable-next-line import/no-named-as-default
import App from './app';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({
  onUpdate: () => {
    // eslint-disable-next-line no-console
    console.log('onUpdate');
  },
});
