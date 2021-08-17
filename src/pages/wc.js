/* eslint-disable no-console */
import React from 'react';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';

import Button from '@material-ui/core/Button';
import Layout from '../components/layout';

export default function WalletConnectPage() {
  const connectWallet = async () => {
    // Create a connector
    const connector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org', // Required
      qrcodeModal: QRCodeModal,
    });

    // Check if connection is already established
    if (!connector.connected) {
      // create new session
      const session = await connector.createSession();
      console.log(session);
    }

    // Subscribe to connection events
    connector.on('connect', (error, payload) => {
      if (error) {
        throw error;
      }

      // Get provided accounts and chainId
      const { accounts, chainId } = payload.params[0];
      console.log(`Connected to bridge. ChainId: ${chainId}, accounts: ${accounts[0]}`);
    });

    console.log('after connect');
    connector.on('session_update', (error, payload) => {
      if (error) {
        throw error;
      }

      // Get updated accounts and chainId
      const { accounts, chainId } = payload.params[0];
      console.log(`Connected to bridge. ChainId: ${chainId}, accounts: ${accounts[0]}`);
    });

    connector.on('disconnect', (error, payload) => {
      if (error) {
        throw error;
      }

      console.log(`disconnect: ${payload}`);
      // Delete connector
    });
    console.log('after all');
  };

  return (
    <Layout title="Wallet Connect">
      <Button variant="contained" color="primary" onClick={() => connectWallet()}>
        Primary
      </Button>
    </Layout>
  );
}
