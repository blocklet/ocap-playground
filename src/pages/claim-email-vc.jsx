/* eslint-disable react/jsx-one-expression-per-line */
import styled from '@emotion/styled';

import Typography from '@mui/material/Typography';

import AuthButton from '../components/auth/general';

export default function MiniPage() {
  return (
    <Main>
      <Typography component="h3" variant="subtitle1" color="textSecondary">
        Claim Fake Email VC on the fly
      </Typography>
      <AuthButton
        button="Claim Email VC"
        action="fake_email_vc"
        extraParams={{ type: 'text' }}
        messages={{
          title: 'Issue you vc from random email',
          scan: 'Connect your DID Wallet to sign a message',
          confirm: 'Confirm on your DID Wallet',
          success: 'vc have send',
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
