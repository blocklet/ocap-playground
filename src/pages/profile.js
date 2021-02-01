/* eslint-disable react/jsx-one-expression-per-line */
import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { fromUnitToToken } from '@arcblock/forge-util';

import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Avatar from '@arcblock/did-react/lib/Avatar';
import Button from '@arcblock/ux/lib/Button';
import useBrowser from '@arcblock/react-hooks/lib/useBrowser';

import { UserContext } from '../context/user';
import Layout from '../components/layout';

export default function ProfilePage() {
  const browser = useBrowser();
  const history = useHistory();
  const { session } = useContext(UserContext);

  const { user, token } = session;

  const onLogout = () => {
    session.logout();
    history.push('/');
    window.location.reload();
  };

  return (
    <Layout title="Profile">
      <Main>
        <Grid container spacing={6}>
          <Grid item xs={12} md={3} className="avatar">
            <Avatar size={240} did={user.did} />
            <Button color="secondary" className="button" variant="contained" href="/orders">
              My Orders
            </Button>
            {!browser.wallet && (
              <Button color="danger" className="button" variant="contained" href="#" onClick={onLogout}>
                Logout
              </Button>
            )}
          </Grid>
          <Grid item xs={12} md={9} className="meta">
            <Typography component="h3" variant="h4">
              My Profile
            </Typography>
            <List>
              <ListItem className="meta-item">
                <ListItemText primary={user.did} secondary="DID" />
              </ListItem>
              <ListItem className="meta-item">
                <ListItemText primary={user.name || '-'} secondary="Name" />
              </ListItem>
              <ListItem className="meta-item">
                <ListItemText primary={user.email || '-'} secondary="Email" />
              </ListItem>
              <ListItem className="meta-item">
                <ListItemText primary={user.mobile || '-'} secondary="Phone" />
              </ListItem>
              <ListItem className="meta-item">
                <ListItemText
                  primary={`${fromUnitToToken(session.balance.local, token.local.decimal)} ${token.local.symbol}`}
                  secondary="Local Balance"
                />
              </ListItem>
              <ListItem className="meta-item">
                <ListItemText
                  primary={`${fromUnitToToken(session.balance.foreign, token.foreign.decimal)} ${token.foreign.symbol}`}
                  secondary="Foreign Balance"
                />
              </ListItem>
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
`;
