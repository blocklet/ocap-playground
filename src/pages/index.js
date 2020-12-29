/* eslint-disable react/jsx-one-expression-per-line */
import React, { useContext } from 'react';
import styled from 'styled-components';

import Typography from '@material-ui/core/Typography';
import Tag from '@arcblock/ux/lib/Tag';
import { SessionContext, PlaygroundAction } from '@arcblock/did-playground';

import Layout from '../components/layout';

import { version } from '../../package.json';
import getWebWalletUrl from '../libs/util';

// 临时 demo 的页面
export default function MiniPage() {
  const { session } = useContext(SessionContext);
  const { token } = session;
  const webWalletUrl = getWebWalletUrl();

  return (
    <Layout title="Home">
      <Main>
        <Typography component="h2" variant="h5" className="page-header" color="textPrimary">
          ABT Wallet Playground Mini<Tag type="success">V{version}</Tag>
        </Typography>
        <Typography component="h3" variant="subtitle1" color="textSecondary">
          {token.local.symbol} is the token on Local Chain, {token.foreign.symbol} is the token on Foreign Chain.
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
              amount={20}
              title={`Get 20 ${token.local.symbol}`}
              webWalletUrl={webWalletUrl}
            />
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Atomic Swap Scenarios{' '}
            <Typography component="small" color="textSecondary">
              Show the full potential of cross-chain transactions.
            </Typography>
          </Typography>
          <div className="section__content">
            <PlaygroundAction
              action="exchange_to_foreign_token"
              title="Exchange Currency"
              className="action"
              buttonVariant="contained"
              buttonText={`Buy 1 ${token.foreign.symbol} with 19.58 ${token.local.symbol}`}
              exchangeRate={19.58}
              webWalletUrl={webWalletUrl}
            />
            <PlaygroundAction
              action="exchange_to_local_token"
              title="Exchange Currency"
              className="action"
              buttonVariant="contained"
              buttonText={`Sell 1 ${token.foreign.symbol} for 19.58 ${token.local.symbol}`}
              exchangeRate={19.58}
              webWalletUrl={webWalletUrl}
            />
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Transfer Scenarios{' '}
            <Typography component="small" color="textSecondary">
              Help to generate different transfer transactions in ABT Wallet
            </Typography>
          </Typography>
          <div className="section__content">
            <PlaygroundAction
              action="send_foreign_token"
              className="action"
              buttonVariant="contained"
              amount={0.1}
              title={`Send 0.1 ${token.foreign.symbol}`}
              webWalletUrl={webWalletUrl}
            />
            <PlaygroundAction
              action="send_local_token"
              className="action"
              buttonVariant="contained"
              amount={10}
              title={`Send 10 ${token.local.symbol}`}
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
