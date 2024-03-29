/* eslint-disable react/jsx-one-expression-per-line */
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { fromUnitToToken } from '@ocap/util';

import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Avatar from '@arcblock/did-connect/lib/Avatar';
import Button from '@arcblock/ux/lib/Button';
import useBrowser from '@arcblock/react-hooks/lib/useBrowser';

import { UserContext } from '../context/user';
import Layout from '../components/layout';

export default function ProfilePage() {
  const browser = useBrowser();
  const navigate = useNavigate();
  const { session } = useContext(UserContext);

  const { user, stake, token } = session;
  const tokens = stake && stake.tokens ? stake.tokens : null;
  const assets = stake && stake.assets ? stake.assets : null;
  const revokedAssets = stake && stake.revokedAssets ? stake.revokedAssets : null;
  const revokedTokens = stake && stake.revokedTokens ? stake.revokedTokens : null;

  const onLogout = () => {
    session.logout();
    navigate('/');
    window.location.reload();
  };

  return (
    <Layout title="Profile">
      <Main>
        <Grid container spacing={6}>
          <Grid item xs={12} md={3} className="avatar">
            {user.avatar ? <img src={user.avatar} alt="user-avatar" /> : <Avatar size={240} did={user.did} />}
            <Button className="button" variant="contained" href="/orders">
              My Orders
            </Button>
            {!browser.wallet && (
              <Button className="button" color="error" variant="contained" href="#" onClick={onLogout}>
                Logout
              </Button>
            )}
          </Grid>
          <Grid item xs={12} md={5} className="meta">
            <Typography component="h3" variant="h4">
              My Profile
            </Typography>
            <List>
              <ListItem className="meta-item">
                <ListItemText primary={user.did} secondary="DID" />
              </ListItem>
              <ListItem className="meta-item">
                <ListItemText primary={user.fullName || '-'} secondary="Name" />
              </ListItem>
              <ListItem className="meta-item">
                <ListItemText primary={user.email || '-'} secondary="Email" />
              </ListItem>
              <ListItem className="meta-item">
                <ListItemText primary={user.mobile || '-'} secondary="Phone" />
              </ListItem>
              <ListItem className="meta-item">
                <ListItemText primary={user.firstLoginAt || '-'} secondary="First Login" />
              </ListItem>
              <ListItem className="meta-item">
                <ListItemText primary={user.lastLoginAt || '-'} secondary="Last Login" />
              </ListItem>
              <ListItem className="meta-item">
                <ListItemText
                  primary={`${fromUnitToToken(session.balance.local, token.local.decimal)} ${token.local.symbol}`}
                />
              </ListItem>
              <ListItem className="meta-item">
                <ListItemText
                  primary={`${fromUnitToToken(session.balance.foreign, token.foreign.decimal)} ${token.foreign.symbol}`}
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={4} className="meta">
            <Typography component="h3" variant="h5">
              Staking <small className="tip">Revocable</small>
            </Typography>
            <List>
              {tokens &&
                tokens.map(tk => {
                  return (
                    <ListItem className="meta-item">
                      <ListItemText primary={`${fromUnitToToken(tk.value, tk.decimal)}`} secondary={tk.symbol} />
                    </ListItem>
                  );
                })}
              {assets &&
                assets.map(nft => {
                  return (
                    <ListItem className="meta-item">
                      <ListItemText primary={nft} secondary="NFT" />
                    </ListItem>
                  );
                })}
            </List>
            <Typography component="h3" variant="h5">
              Revoked <small className="tip">Pending for Claim</small>
            </Typography>
            <List>
              {revokedTokens &&
                revokedTokens.map(tk => {
                  return (
                    <ListItem className="meta-item">
                      <ListItemText primary={`${fromUnitToToken(tk.value, tk.decimal)}`} secondary={tk.symbol} />
                    </ListItem>
                  );
                })}
              {revokedAssets &&
                revokedAssets.map(nft => {
                  return (
                    <ListItem className="meta-item">
                      <ListItemText primary={nft} secondary="NFT" />
                    </ListItem>
                  );
                })}
            </List>
          </Grid>
        </Grid>
      </Main>
    </Layout>
  );
}

const Main = styled.main`
  display: flex;

  .button {
    margin-bottom: 32px;
  }
  .button:last-of-type {
    margin-bottom: 0;
  }

  .avatar {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-center;

    svg {
      margin-bottom: 40px;
    }

    img {
      margin-bottom: 40px;
      border-radius: 50%;
      height: 240px;
      width: 240px;
    }
  }

  .meta {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }

  .meta-item {
    padding-left: 0;
  }

  .tip {
    font-size: 1rem;
  }
`;
