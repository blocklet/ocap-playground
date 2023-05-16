/* eslint-disable react/jsx-one-expression-per-line */
import styled from '@emotion/styled';

import Typography from '@mui/material/Typography';

import AuthButton from '../components/auth/general';

export default function MiniPage() {
  return (
    <Main>
      <Typography component="h3" variant="subtitle1" color="textSecondary">
        Acquire Server NFT
      </Typography>
      <AuthButton
        button="Purchase Server NFT"
        action="acquire_asset"
        extraParams={{ factory: 'nodePurchase' }}
        messages={{
          title: 'Pay to Purchase',
          scan: 'Connect your DID Wallet to complete the purchase',
          confirm: 'Confirm on your DID Wallet',
          success: 'The purchase was successful, now you can launch your node',
        }}
      />
    </Main>
  );
}

const Main = styled.main`
  padding: 24px;

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
`;
