/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import styled from 'styled-components';
import useAsync from 'react-use/lib/useAsync';
import { fromUnitToToken } from '@arcblock/forge-util';

import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';

import ClickToCopy from '@arcblock/ux/lib/ClickToCopy';
import TextCollapse from '@arcblock/ux/lib/TextCollapse';
import Button from '@arcblock/ux/lib/Button';
import CodeBlock from '@arcblock/ux/lib/CodeBlock';
import DidAuth from '@arcblock/did-react/lib/Auth';
import DidAddress from '@arcblock/did-react/lib/Address';

import Layout from '../components/layout';
import api from '../libs/api';

function getChainExplorerAddress(url = '') {
  return url.replace('/api', '/node/explorer');
}

async function fetchOrders() {
  const { data: orders } = await api.get('/api/orders');
  return orders;
}

// eslint-disable-next-line react/prop-types
function OrderStatus({ traceId, status }) {
  const [isOpen, setOpen] = React.useState(false);

  if (['both_retrieve', 'user_retrieve', 'expired'].includes(status)) {
    return status;
  }

  return (
    <React.Fragment>
      <Button variant="outlined" color="secondary" size="small" onClick={() => setOpen(true)}>
        Checkout
      </Button>
      {isOpen && (
        <DidAuth
          responsive
          action="pickup_swap"
          checkFn={api.get}
          onClose={() => setOpen()}
          checkTimeout={5 * 60 * 1000}
          onSuccess={() => window.location.reload()}
          extraParams={{ tid: traceId }}
          messages={{
            title: 'Checkout',
            scan: 'Scan QR code to checkout',
            confirm: 'Confirm on your ABT Wallet',
            success: 'Payment Success',
          }}
        />
      )}
    </React.Fragment>
  );
}

function OrderDetail(props) {
  const [isOpen, setOpen] = React.useState(false);
  const onClose = () => setOpen(false);

  return (
    <React.Fragment>
      <Button variant="outlined" color="secondary" size="small" onClick={() => setOpen(true)}>
        Detail
      </Button>
      {isOpen && (
        <Dialog open onClose={onClose} maxWidth="lg">
          <DialogTitle id="alert-dialog-title">Order Detail</DialogTitle>
          <DialogContent>
            <CodeBlock language="json" style={{ marginBottom: 0 }}>
              {JSON.stringify(props, null, 2)}
            </CodeBlock>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="primary" variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </React.Fragment>
  );
}

export default function OrdersPage() {
  const state = useAsync(fetchOrders);

  if (state.loading || !state.value) {
    return (
      <Layout title="Orders">
        <Main>
          <CircularProgress />
        </Main>
      </Layout>
    );
  }

  if (state.error) {
    return (
      <Layout title="Orders">
        <Main>{state.error.message}</Main>
      </Layout>
    );
  }

  const { orders, tokenInfo } = state.value;
  const filterByChain = x => tokenInfo[x.offerChainId] && tokenInfo[x.demandChainId];

  return (
    <Layout title="Orders">
      <Main>
        <Typography variant="h4" component="h2" className="page-title">
          Recent Orders
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Bought</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Updated At</TableCell>
              <TableCell>Detail</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders
              .filter(x => filterByChain(x))
              .map(x => (
                // eslint-disable-next-line
                <TableRow key={x._id}>
                  <TableCell>
                    <ClickToCopy content={x.traceId}>
                      <TextCollapse maxWidth={90}>{x.traceId}</TextCollapse>
                    </ClickToCopy>
                  </TableCell>
                  <TableCell>
                    {x.offerToken > 0 &&
                      `${fromUnitToToken(x.offerToken, tokenInfo[x.offerChainId].decimal)} ${
                        tokenInfo[x.offerChainId].symbol
                      }`}
                    {x.offerAssets.map(asset => (
                      <Link
                        key={asset}
                        href={`${getChainExplorerAddress(x.offerChainHost)}/assets/${asset}`}
                        target="_blank">
                        <DidAddress copyable={false}>{asset}</DidAddress>
                      </Link>
                    ))}
                  </TableCell>
                  <TableCell>
                    {x.demandToken > 0 &&
                      `${fromUnitToToken(x.demandToken, tokenInfo[x.demandChainId].decimal)} ${
                        tokenInfo[x.demandChainId].symbol
                      }`}
                    {x.demandAssets.map(asset => (
                      <Link
                        key={asset}
                        href={`${getChainExplorerAddress(x.demandChainHost)}/assets/${asset}`}
                        target="_blank">
                        <DidAddress copyable={false}>{asset}</DidAddress>
                      </Link>
                    ))}
                  </TableCell>
                  <TableCell>
                    <OrderStatus {...x} />
                  </TableCell>
                  <TableCell>{new Date(x.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{new Date(x.updatedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <OrderDetail {...x} />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Main>
    </Layout>
  );
}

const Main = styled.main`
  .page-title {
    margin-bottom: 32px;
  }

  a,
  a:hover {
    text-decoration: none;
  }

  a:hover {
    opacity: 0.7;
  }
`;
