/* eslint-disable no-console */
import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorkerRegistration from './service-worker-registration';
// eslint-disable-next-line import/no-named-as-default
import App from './app';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
let refreshing = false;

serviceWorkerRegistration.register({
  onUpdate: () => {
    if (refreshing) {
      return;
    }

    refreshing = true;
    window.location.reload();
  },
  onSuccess: () => {
    refreshing = false;
  },
});
