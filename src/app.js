import { ThemeProvider as MuiThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { Global, css, ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { SessionProvider } from '@arcblock/did-playground';
import { getWebWalletUrl } from '@arcblock/did-connect/lib/utils';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';

import { UserProvider } from './context/user';
import { ToastProvider } from './components/toast';
import HomePage from './pages/full';
import ProfilePage from './pages/profile';
import MiniPage from './pages/index';

import theme from './libs/theme';

const globalStyles = css`
  a {
    color: ${theme.colors.green};
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

export function App() {
  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <EmotionThemeProvider theme={theme}>
          <SessionProvider serviceHost={apiPrefix} webWalletUrl={webWalletUrl}>
            {({ session }) => {
              if (session.loading) {
                return <CircularProgress />;
              }

              if (session.user) {
                return (
                  <UserProvider>
                    <ToastProvider>
                      {/* <Header
                      // className={clsx(classes.header)}
                      // meta={info.meta}
                      // eslint-disable-next-line react/no-unstable-nested-components
                      // addons={addons => {
                      //   return {addons}
                      // }}
                      /> */}
                      <CssBaseline />
                      <Global styles={globalStyles} />
                      <div className="wrapper">
                        <Routes>
                          <Route path="/" element={<MiniPage />} />
                          <Route path="/full" element={<HomePage />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </div>
                    </ToastProvider>
                  </UserProvider>
                );
              }

              return null;
            }}
          </SessionProvider>
        </EmotionThemeProvider>
      </MuiThemeProvider>
    </StyledEngineProvider>
  );
}

export default function Main() {
  let basename = '/';

  if (window.env && window.env.apiPrefix) {
    basename = window.env.apiPrefix.indexOf('.netlify/') > -1 ? '/' : window.env.apiPrefix;
  }

  if (window.blocklet && window.blocklet.prefix) {
    basename = window.blocklet.prefix;
  }

  return (
    <Router basename={basename}>
      <App />
    </Router>
  );
}
