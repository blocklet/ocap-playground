/* eslint-disable prefer-destructuring */
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Header from '@blocklet/ui-react/lib/Header';

export default function Layout({ children }) {
  const getExplorerUrl = (chainHost, type) => {
    if (window.env) {
      if (window.env.localChainExplorer && type === 'local') {
        return window.env.localChainExplorer;
      }
      if (window.env.foreignChainExplorer && type === 'foreign') {
        return window.env.foreignChainExplorer;
      }
    }

    const [host] = chainHost.split('/api');
    return `${host}/node/explorer/txs`;
  };

  let prefix = '/';
  if (window.blocklet && window.blocklet.prefix) {
    prefix = window.blocklet.prefix;
  } else if (window.env && window.env.apiPrefix) {
    prefix = window.env.apiPrefix.indexOf('.netlify/') > -1 ? '/' : window.env.apiPrefix;
  }

  let apiPrefix = prefix.replace(/^\/+/, '').replace(/\/+$/, '');
  if (apiPrefix) {
    apiPrefix = `/${apiPrefix}`;
  }

  const links = [
    { url: `${apiPrefix}/`, title: 'Home' },
    { url: `${apiPrefix}/full`, title: 'Everything' },
    { url: `${apiPrefix}/profile`, title: 'Profile' },
  ];

  if (window.env.chainHost) {
    links.push({ url: getExplorerUrl(window.env.chainHost, 'local'), title: 'Explorer' });
  }
  links.push({ url: 'https://github.com/blocklet/ocap-playground', title: 'GitHub' });

  return (
    <Box>
      <Header />
      <Container maxWidth="lg" my={3}>
        {children}
      </Container>
    </Box>
  );
}

Layout.propTypes = {
  children: PropTypes.any.isRequired,
};
