import React from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Route, Switch, Redirect, withRouter } from 'react-router-dom';
import { SessionProvider } from '@arcblock/did-playground';

import CssBaseline from '@material-ui/core/CssBaseline';
import CircularProgress from '@material-ui/core/CircularProgress';

import { UserProvider } from './context/user';

import HomePage from './pages/full';
import ProfilePage from './pages/profile';
import MiniPage from './pages/index';

import theme from './libs/theme';
import getWebWalletUrl from './libs/util';

const GlobalStyle = createGlobalStyle`
  a {
    color: ${props => props.theme.colors.green};
    text-decoration: none;
  }
  a:hover,
  a:hover * {
    text-decoration: none !important;
  }
`;

let apiPrefix = '/';
if (window.blocklet && window.blocklet.prefix) {
  apiPrefix = window.blocklet.prefix;
} else if (window.env && window.env.apiPrefix) {
  apiPrefix = window.env.apiPrefix;
}
const webWalletUrl = getWebWalletUrl();

export const App = () => (
  <MuiThemeProvider theme={theme}>
    <ThemeProvider theme={theme}>
      <SessionProvider serviceHost={apiPrefix} webWalletUrl={webWalletUrl}>
        {({ session }) => {
          if (session.loading) {
            return <CircularProgress />;
          }

          if (session.user) {
            return (
              <UserProvider>
                <>
                  <CssBaseline />
                  <GlobalStyle />
                  <div className="wrapper">
                    <Switch>
                      <Route exact path="/" component={MiniPage} />
                      <Route exact path="/full" component={HomePage} />
                      <Route exact path="/profile" component={ProfilePage} />
                      <Redirect to="/" />
                    </Switch>
                  </div>
                </>
              </UserProvider>
            );
          }

          return null;
        }}
      </SessionProvider>
    </ThemeProvider>
  </MuiThemeProvider>
);

const WrappedApp = withRouter(App);

export default () => {
  let basename = '/';

  if (window.env && window.env.apiPrefix) {
    basename = window.env.apiPrefix.indexOf('.netlify/') > -1 ? '/' : window.env.apiPrefix;
  }

  if (window.blocklet && window.blocklet.prefix) {
    basename = window.blocklet.prefix;
  }

  return (
    <Router basename={basename}>
      <WrappedApp />
    </Router>
  );
};
