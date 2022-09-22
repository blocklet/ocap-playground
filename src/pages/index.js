/* eslint-disable react/jsx-one-expression-per-line */
import { useContext } from 'react';
import styled from '@emotion/styled';

import Typography from '@mui/material/Typography';
// import { PlaygroundAction } from '@arcblock/did-playground';
// import { getWebWalletUrl } from '@arcblock/did-connect/lib/utils';

import Header from '@blocklet/ui-react/lib/Header';
import { UserContext } from '../context/user';
import Layout from '../components/layout';
import AuthButton from '../components/auth/general';

// 临时 demo 的页面
export default function MiniPage() {
  const { session } = useContext(UserContext);
  const { token } = session;
  // const webWalletUrl = getWebWalletUrl();

  return (
    <Layout title="Home">
      <Main>
        <Header
          // eslint-disable-next-line react/no-unstable-nested-components
          addons={addons => {
            // eslint-disable-next-line react/jsx-no-useless-fragment
            return <>{addons}</>;
          }}
        />
        <Typography component="h3" variant="subtitle1" color="textSecondary">
          {token.local.symbol} is the primary token, {token.foreign.symbol} is the secondary token.
        </Typography>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Actions{' '}
            <Typography component="small" color="textSecondary">
              Get your account funded for doing later testing
            </Typography>
          </Typography>
          <div className="section__content">
            <AuthButton
              button="sign typed data"
              action="eth_sign"
              extraParams={{ type: 'eth_typed_data' }}
              messages={{
                title: 'You will get a random badge',
                scan: 'Connect your DID Wallet to sign a message',
                confirm: 'Confirm on your DID Wallet',
                success: 'sign success',
              }}
            />
            <AuthButton
              button="eth legacy sign"
              action="eth_sign"
              extraParams={{ type: 'eth_legacy_data' }}
              messages={{
                title: 'Same As Wallet Connect Sign Data',
                scan: 'Connect your DID Wallet to sign a message',
                confirm: 'Confirm on your DID Wallet',
                success: 'sign success',
              }}
            />
            <AuthButton
              button="eth sign"
              action="eth_sign"
              extraParams={{ type: 'eth_standard_data' }}
              messages={{
                title: 'Same As Wallet Connect Sign Data',
                scan: 'Connect your DID Wallet to sign a message',
                confirm: 'Confirm on your DID Wallet',
                success: 'sign success',
              }}
            />

            <AuthButton
              button="personal sign"
              action="eth_sign"
              extraParams={{ type: 'eth_personal_sign' }}
              messages={{
                title: 'Same As Wallet Connect Sign Personal Data',
                scan: 'Connect your DID Wallet to sign a message',
                confirm: 'Confirm on your DID Wallet',
                success: 'sign success',
              }}
            />

            <AuthButton
              button="send 0.01 rinkeby"
              action="eth_sign"
              extraParams={{ type: 'eth_tx' }}
              messages={{
                title: 'Same As Wallet Connect Sign Transaction',
                scan: 'Connect your DID Wallet to sign a message',
                confirm: 'Confirm on your DID Wallet',
                success: 'sign success',
              }}
            />
          </div>
        </section>
      </Main>
    </Layout>
  );
}

const Main = styled.main`
  a {
    color: ${props => props.theme.colors.green};
    text-decoration: none;
  }

  .page-header {
    margin-bottom: 20px;
  }

  .page-description {
    margin-bottom: 30px;
  }

  .section {
    margin-top: 32px;
    .section__header {
      margin-bottom: 24px;
    }

    .section__content {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      align-items: flex-start;

      .action {
        margin-bottom: 16px;
        margin-right: 32px;
        max-width: 320px;
        @media (max-width: ${props => props.theme.breakpoints.values.sm}px) {
          margin-right: 0;
        }
        width: 100%;
        display: block;
      }
    }
  }
`;
