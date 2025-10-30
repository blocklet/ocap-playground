import { useContext } from 'react';
import {  StyledEngineProvider } from '@mui/material/styles';
import { Global, css } from '@emotion/react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { getWebWalletUrl } from '@arcblock/did-connect-react/lib/utils';
import { ConfigProvider } from '@arcblock/ux/lib/Config';

import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';

import { UserProvider } from './context/user';
import { ToastProvider } from './components/toast';
import { SessionProvider, SessionContext } from './components/did-playground';

import HomePage from './pages/full';
import ProfilePage from './pages/profile';
import ClaimPage from './pages/claim-email-vc';
import ClaimPassportPage from './pages/claim-passport';
import AcquireServerPage from './pages/acquire-server';

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
  const { session } = useContext(SessionContext);

  if (!session.user) {
    return <CircularProgress />;
  }

  return (
    <UserProvider>
      <ToastProvider>
        <CssBaseline />
        <Global styles={globalStyles} />
        <div className="wrapper">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/claim/email" element={<ClaimPage />} />
            <Route path="/claim/passport" element={<ClaimPassportPage />} />
            <Route path="/acquire/server" element={<AcquireServerPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ToastProvider>
    </UserProvider>
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
      <StyledEngineProvider injectFirst>
        <ConfigProvider fallbackLocale="en">
          <SessionProvider serviceHost={apiPrefix} webWalletUrl={webWalletUrl}>
            <App />
          </SessionProvider>
        </ConfigProvider>
      </StyledEngineProvider>
    </Router>
  );
}
