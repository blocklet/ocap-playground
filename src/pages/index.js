/* eslint-disable react/jsx-one-expression-per-line */
import React, { useContext } from 'react';
import styled from 'styled-components';

import Typography from '@material-ui/core/Typography';
import { PlaygroundAction } from '@arcblock/did-playground';

import { UserContext } from '../context/user';
import Layout from '../components/layout';

import getWebWalletUrl from '../libs/util';

// 临时 demo 的页面
export default function MiniPage() {
  const { session } = useContext(UserContext);
  const { token } = session;
  const webWalletUrl = getWebWalletUrl();

  return (
    <Layout title="Home">
      <Main>
        <Typography component="h3" variant="subtitle1" color="textSecondary">
          {token.local.symbol} is the primary token, {token.foreign.symbol} is the secondary token.
        </Typography>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Feeling lucky{' '}
            <Typography component="small" color="textSecondary">
              Get your account funded for doing later testing
            </Typography>
          </Typography>
          <div className="section__content">
            <PlaygroundAction
              action="login"
              className="action"
              buttonRounded
              buttonVariant="contained"
              buttonText="Please Login"
              successMessage="Hello (%user.name%)"
              webWalletUrl={webWalletUrl}
            />
            <PlaygroundAction
              action="receive_foreign_token"
              className="action"
              buttonVariant="contained"
              amount={10}
              title={`Get 10 ${token.foreign.symbol}`}
              webWalletUrl={webWalletUrl}
            />
            <PlaygroundAction
              action="receive_local_token"
              className="action"
              amount={10}
              title={`Get 10 ${token.local.symbol}`}
              webWalletUrl={webWalletUrl}
            />
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Transfer Scenarios{' '}
            <Typography component="small" color="textSecondary">
              Help to generate different transfer transactions in DID Wallet
            </Typography>
          </Typography>
          <div className="section__content">
            <PlaygroundAction
              action="send_foreign_token"
              className="action"
              buttonVariant="contained"
              amount={0.5}
              title={`Send 0.5 ${token.foreign.symbol}`}
              webWalletUrl={webWalletUrl}
            />
            <PlaygroundAction
              action="send_local_token"
              className="action"
              buttonVariant="contained"
              amount={0.5}
              title={`Send 0.5 ${token.local.symbol}`}
              webWalletUrl={webWalletUrl}
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
        max-width: 360px;
        @media (max-width: ${props => props.theme.breakpoints.values.sm}px) {
          margin-right: 0;
        }
        width: 100%;
        display: block;
      }
    }
  }
`;
