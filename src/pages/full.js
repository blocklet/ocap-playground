/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable arrow-parens */
import React, { useContext } from 'react';
import styled from 'styled-components';
import useBrowser from '@arcblock/react-hooks/lib/useBrowser';

import Typography from '@material-ui/core/Typography';
import WalletDownload from '@arcblock/ux/lib/Wallet/Download';
import { PlaygroundAction } from '@arcblock/did-playground';

import Button from '@arcblock/ux/lib/Button';
import Layout from '../components/layout';

import AuthButton from '../components/auth/general';
import ClaimButton from '../components/auth/claim-stake';
import SignButton from '../components/auth/auth/sign';
import TransferAssetOut from '../components/auth/transfer-asset-out';
import TransferAssetIn from '../components/auth/transfer-asset-in';
import TransferTokenAssetIn from '../components/auth/transfer-token-asset-in';
import TransferTokenAssetOut from '../components/auth/transfer-token-asset-out';
import NotificationButton from '../components/notification/button';

import { UserContext } from '../context/user';

export default function IndexPage() {
  const browser = useBrowser();
  const { session } = useContext(UserContext);

  const { token } = session;

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
              action="receive_foreign_token"
              className="action"
              buttonVariant="contained"
              amount="random"
              title={`Get Random ${token.foreign.symbol}`}
            />
            <PlaygroundAction
              action="receive_local_token"
              className="action"
              amount="random"
              title={`Get Random ${token.local.symbol}`}
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
              action="receive_local_token"
              className="action"
              amount={1}
              title={`Send 1 ${token.local.symbol} to me`}
            />
            <PlaygroundAction
              action="send_local_token"
              className="action"
              amount={1}
              title={`Send 1 ${token.local.symbol} to application`}
            />
            <TransferAssetOut {...session} />
            <TransferAssetIn {...session} />
            <TransferTokenAssetIn {...session} />
            <TransferTokenAssetOut {...session} />
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Exchange Scenarios (primary token){' '}
            <Typography component="small" color="textSecondary">
              Help to generate different exchange transactions in DID Wallet
            </Typography>
          </Typography>
          <div className="section__content">
            <PlaygroundAction
              className="action"
              title={`Buy 1 Certificate with 1 ${token.local.symbol}`}
              action="buy_local_certificate_with_local_token"
              payAmount={1}
              receiveAmount={1}
              name="Certificate (%token.local.symbol%)"
            />
            <PlaygroundAction
              className="action"
              title="Buy 1 Badge for Free"
              action="buy_local_badge_with_local_token"
              payAmount={0}
              receiveAmount={1}
              name="Badge (%token.local.symbol%)"
              svg="./public/static/images/badge.svg"
            />
            <PlaygroundAction
              className="action"
              title="Buy 1 Ticket with 1 Certificate"
              action="buy_local_ticket_with_local_certificate"
              payAmount={1}
              receiveAmount={1}
              name="Ticket (%token.local.symbol%)"
            />
          </div>
        </section>

        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Exchange Scenarios (cross tokens){' '}
            <Typography component="small" color="textSecondary">
              Show the full potential of cross-token transactions.
            </Typography>
          </Typography>
          <div className="section__content">
            <PlaygroundAction
              action="exchange_to_foreign_token_v2"
              title="Exchange Currency"
              className="action"
              buttonVariant="contained"
              buttonText={`Buy 1 ${token.local.symbol} with 5 ${token.foreign.symbol}`}
              exchangeRate={5}
              amount={1}
            />
            <PlaygroundAction
              action="exchange_to_local_token_v2"
              title="Exchange Currency"
              className="action"
              buttonVariant="contained"
              buttonText={`Sell 1 ${token.local.symbol} for 5 ${token.foreign.symbol}`}
              exchangeRate={5}
              amount={1}
            />
          </div>
        </section>

        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            NFT Scenarios{' '}
            <Typography component="small" color="textSecondary">
              Acquire assets with token or assets
            </Typography>
          </Typography>
          <div className="section__content">
            <AuthButton
              button="Purchase ABT Node"
              action="acquire_asset"
              extraParams={{ factory: 'nodePurchase' }}
              messages={{
                title: `Pay ${token.foreign.symbol} to Purchase`,
                scan: 'Connect your DID Wallet to complete the purchase',
                confirm: 'Confirm on your DID Wallet',
                success: 'The purchase was successful, now you can launch your node',
              }}
            />
            <AuthButton
              button="Purchase Blocklet"
              action="acquire_asset"
              extraParams={{ factory: 'blockletPurchase' }}
              messages={{
                title: `Pay ${token.foreign.symbol} to Purchase`,
                scan: 'Connect your DID Wallet to complete the purchase',
                confirm: 'Confirm on your DID Wallet',
                success: 'The purchase was successful, now you can install blocklet on your node',
              }}
            />
            <AuthButton
              button="Buy Endpoint Test NFT"
              action="acquire_asset"
              extraParams={{ factory: 'endpointTest' }}
              messages={{
                title: `Pay ${token.local.symbol} to Purchase`,
                scan: 'Connect your DID Wallet to complete the purchase',
                confirm: 'Confirm on your DID Wallet',
                success: 'The purchase was successful, now you can play with the nft in DID Wallet',
              }}
            />
            <AuthButton
              button="Buy Token Input Test NFT"
              action="acquire_asset"
              extraParams={{ factory: 'tokenInputTest' }}
              messages={{
                title: 'Pay 2 tokens to Purchase',
                scan: 'Connect your DID Wallet to complete the purchase',
                confirm: 'Confirm on your DID Wallet',
                success: 'The purchase was successful, now you can play with the nft in DID Wallet',
              }}
            />
            <AuthButton
              button="Verify Node Ownership"
              action="verify-nft"
              extraParams={{ type: 'node' }}
              messages={{
                title: 'Provide Node Ownership NFT',
                scan: 'Connect your DID Wallet to provide',
                confirm: 'Confirm on your DID Wallet',
                success: 'Ownership verified',
              }}
            />
            <AuthButton
              button="Verify Blocklet Purchase"
              action="verify-nft"
              extraParams={{ type: 'blocklet' }}
              messages={{
                title: 'Provide Blocklet Purchase NFT',
                scan: 'Connect your DID Wallet to provide',
                confirm: 'Confirm on your DID Wallet',
                success: 'Purchase verified',
              }}
            />
            <AuthButton
              button="Shopping Chart"
              action="launch-service"
              extraParams={{ type: 'node_blocklet' }}
              messages={{
                title: 'Provide Node and Blocklet Purchase NFT',
                scan: 'Connect your DID Wallet to provide',
                confirm: 'Confirm on your DID Wallet',
                success: 'Purchase verified',
              }}
            />
          </div>
        </section>

        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Delegation Scenarios{' '}
            <Typography component="small" color="textSecondary">
              Wallet should use delegation to complete payment if current balance is not enough
            </Typography>
          </Typography>
          <div className="section__content">
            <AuthButton
              button={`Acquire: ${token.local.symbol} Only`}
              action="delegate"
              extraParams={{ type: 'AcquireAssetV2Tx', input: 'local' }}
              messages={{
                title: `Pay ${token.local.symbol} to Purchase`,
                scan: 'Connect your DID Wallet to complete the purchase',
                confirm: 'Confirm on your DID Wallet',
                success: 'The purchase was successful, now you can install blocklet on your node',
              }}
            />
            <AuthButton
              button={`Acquire: ${token.foreign.symbol} Only`}
              action="delegate"
              extraParams={{ type: 'AcquireAssetV2Tx', input: 'foreign' }}
              messages={{
                title: `Pay ${token.foreign.symbol} to Purchase`,
                scan: 'Connect your DID Wallet to complete the purchase',
                confirm: 'Confirm on your DID Wallet',
                success: 'The purchase was successful, now you can install blocklet on your node',
              }}
            />
            <AuthButton
              button={`Acquire: ${token.local.symbol} + ${token.foreign.symbol}`}
              action="delegate"
              extraParams={{ type: 'AcquireAssetV2Tx', input: 'both' }}
              messages={{
                title: `Pay ${token.local.symbol} and ${token.foreign.symbol} to Purchase`,
                scan: 'Connect your DID Wallet to complete the purchase',
                confirm: 'Confirm on your DID Wallet',
                success: 'The purchase was successful, now you can install blocklet on your node',
              }}
            />
            <AuthButton
              button="Transfer"
              action="delegate"
              extraParams={{ type: 'TransferV2Tx' }}
              messages={{
                title: `Pay ${token.foreign.symbol}`,
                scan: 'Connect your DID Wallet to complete the transfer',
                confirm: 'Confirm on your DID Wallet',
                success: 'Payment successful',
              }}
            />
            <AuthButton
              button="Exchange"
              action="delegate"
              extraParams={{ type: 'ExchangeV2Tx' }}
              messages={{
                title: `Exchange ${token.foreign.symbol} for ${token.local.symbol}`,
                scan: 'Connect your DID Wallet to complete the exchange',
                confirm: 'Confirm on your DID Wallet',
                success: 'Exchange successful',
              }}
            />
          </div>
        </section>

        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Multiple Input Scenarios{' '}
            <Typography component="small" color="textSecondary">
              Wallet can leverage multiple input capabilities of the chain
            </Typography>
          </Typography>
          <div className="section__content">
            <AuthButton
              button={`TransferV3: ${token.local.symbol} + ${token.foreign.symbol}`}
              action="prepare"
              extraParams={{ type: 'TransferV3Tx', input: 'both' }}
              messages={{
                title: `Pay ${token.local.symbol} and ${token.foreign.symbol} to Purchase`,
                scan: 'Connect your DID Wallet to complete the transaction',
                confirm: 'Confirm on your DID Wallet',
                success: 'The purchase was successful',
              }}
            />
            <AuthButton
              button="TransferV3: Multi Output"
              action="prepare"
              extraParams={{ type: 'TransferV3TxOutput', input: 'both' }}
              messages={{
                title: `Pay ${token.local.symbol} and ${token.foreign.symbol} to Purchase`,
                scan: 'Connect your DID Wallet to complete the transaction',
                confirm: 'Confirm on your DID Wallet',
                success: 'The purchase was successful',
              }}
            />
            <AuthButton
              button="AcquireAssetV3Tx: Need Asset"
              action="prepare"
              extraParams={{ type: 'AcquireAssetV3TxAsset', input: 'both' }}
              messages={{
                title: `Pay ${token.local.symbol} and ${token.foreign.symbol} to Purchase`,
                scan: 'Connect your DID Wallet to complete the transaction',
                confirm: 'Confirm on your DID Wallet',
                success: 'The purchase was successful',
              }}
            />

            <AuthButton
              button={`AcquireV3: ${token.local.symbol} + ${token.foreign.symbol}`}
              action="prepare"
              extraParams={{ type: 'AcquireAssetV3Tx', input: 'both' }}
              messages={{
                title: `Pay ${token.local.symbol} and ${token.foreign.symbol} to Purchase`,
                scan: 'Connect your DID Wallet to complete the transaction',
                confirm: 'Confirm on your DID Wallet',
                success: 'The purchase was successful',
              }}
            />
          </div>
        </section>

        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Custom Success Message Scenarios{' '}
            <Typography component="small" color="textSecondary">
              Custom Success Message
            </Typography>
          </Typography>
          <div className="section__content">
            <PlaygroundAction
              className="action"
              title="Simple Message"
              action="claim_signature"
              type="text"
              name="Local Ticket (%token.local.symbol%)"
              successMessage="(%user.name%) Operation Success"
            />
            <PlaygroundAction
              autoClose={false}
              className="action"
              title="Children React Component"
              action="claim_signature"
              type="text"
              name="Local Ticket (%token.local.symbol%)">
              <PlaygroundAction
                className="action"
                title="Simple Message"
                action="claim_signature"
                type="text"
                name="Local Ticket (%token.local.symbol%)"
                successMessage="Operation Success"
              />
            </PlaygroundAction>
            <PlaygroundAction
              className="action"
              title="Open URL in Current Tab"
              action="claim_signature"
              type="text"
              name="Local Ticket (%token.local.symbol%)"
              successTarget="_self"
              successUrl="https://www.arcblock.io"
            />
            <PlaygroundAction
              className="action"
              title="Open URL in New Tab"
              action="claim_signature"
              type="text"
              name="Local Ticket (%token.local.symbol%)"
              successTarget="_blank"
              successUrl="https://www.arcblock.io"
            />
            <PlaygroundAction
              className="action"
              title="Open URL in iframe"
              action="claim_signature"
              type="text"
              name="Local Ticket (%token.local.symbol%)"
              successTarget="frame"
              successUrl="https://www.arcblock.io"
            />
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            DID Auth Claims{' '}
            <Typography component="small" color="textSecondary">
              Help to test different DID Auth Claims in DID Wallet
            </Typography>
          </Typography>
          <div className="section__content">
            <AuthButton
              button="Request Full Profile"
              action="profile"
              messages={{
                title: 'Profile Required',
                scan: 'Connect your DID Wallet to provide profile',
                confirm: 'Confirm on your DID Wallet',
                success: 'Profile provided',
              }}
            />
            <AuthButton
              button="Request Profile WithOut ChainInfo"
              action="profile_no_chain_info"
              messages={{
                title: 'Profile Required',
                scan: 'Connect your DID Wallet to provide profile',
                confirm: 'Confirm on your DID Wallet',
                success: 'Profile provided',
              }}
            />
            <AuthButton
              button="Show DApp Error"
              action="error"
              messages={{
                title: 'dApp will throw an error',
                scan: 'Connect your DID Wallet to get the error',
                confirm: 'Confirm on your DID Wallet',
                success: 'You will not see this',
              }}
            />
            <AuthButton
              button="Auth Request Timeout"
              action="timeout"
              extraParams={{ stage: 'request' }}
              messages={{
                title: 'Request Timeout',
                scan: 'Connect your DID Wallet to test the timeout',
                confirm: 'Confirm on your DID Wallet',
                success: 'You will not see this',
              }}
            />
            <AuthButton
              button="Auth Response Timeout"
              action="timeout"
              extraParams={{ stage: 'response' }}
              messages={{
                title: 'Response Timeout',
                scan: 'Connect your DID Wallet to test the timeout',
                confirm: 'Confirm on your DID Wallet',
                success: 'You will not see this',
              }}
            />
            <AuthButton
              button="Create New DID"
              action="claim_create_did"
              messages={{
                title: 'Create DID',
                scan: 'Connect your DID Wallet to get the did spec',
                confirm: 'Confirm on your DID Wallet',
                success: 'Application Created',
              }}
            />
            <AuthButton
              button="Proof of DID Holding"
              action="claim_target"
              messages={{
                title: 'Provide DID',
                scan: 'Connect your DID Wallet to prove you own the DID',
                confirm: 'Confirm on your DID Wallet',
                success: 'DID holding confirmed',
              }}
            />
            <SignButton {...session} type="transaction" />
            <SignButton {...session} type="text" />
            <SignButton {...session} type="html" />
            <SignButton {...session} type="skip_hash" />
            <AuthButton
              button="Multiple Claims"
              action="claim_multiple"
              messages={{
                title: 'Multiple Claims',
                scan: 'Connect your DID Wallet to get multiple claims at once',
                confirm: 'Confirm on your DID Wallet',
                success: 'Claims processed successfully',
              }}
            />
            <AuthButton
              button="Multiple Steps"
              action="claim_multiple_step"
              messages={{
                title: 'Multiple Steps',
                scan: 'Connect your DID Wallet to get multiple claims in sequential',
                confirm: 'Confirm on your DID Wallet',
                success: 'Claims processed successfully',
              }}
            />
            <AuthButton
              button="Multiple Workflow"
              action="claim_multiple_workflow"
              messages={{
                title: 'Multiple Workflow',
                scan: 'Connect your DID Wallet to start a workflow that redirect to another',
                confirm: 'Confirm on your DID Wallet',
                success: 'Step One processed successfully',
              }}
            />
            <AuthButton
              button="Extra Params"
              action="extra_params"
              extraParams={{
                string: 'string',
                // object: { key: 'value' },
                number: 1234,
                boolean: true,
                array: ['abcd', '1234', 'ABCD'],
              }}
              messages={{
                title: 'Extra Params',
                scan: 'Scan to see if your wallet can pass through correct extra params',
                confirm: 'Confirm on your DID Wallet',
                success: 'Operation Success',
              }}
            />
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Verified Credential{' '}
            <Typography component="small" color="textSecondary">
              verify your email
            </Typography>
          </Typography>
          <div className="section__content">
            <Button
              variant="contained"
              color="primary"
              size="large"
              href="https://kyc.didconnect.io/"
              target="_blank"
              className="action">
              Apply for VC
            </Button>
            <AuthButton
              button="Fake issuer VC"
              action="fake_issuer_vc"
              extraParams={{ type: 'text' }}
              messages={{
                title: 'Issue you vc from random issuer',
                scan: 'Connect your DID Wallet to sign a message',
                confirm: 'Confirm on your DID Wallet',
                success: 'vc have send',
              }}
            />
            <AuthButton
              button="Fake email VC"
              action="fake_email_vc"
              extraParams={{ type: 'text' }}
              messages={{
                title: 'Issue you vc from random email',
                scan: 'Connect your DID Wallet to sign a message',
                confirm: 'Confirm on your DID Wallet',
                success: 'vc have send',
              }}
            />
            <AuthButton
              button="consume email VC"
              action="consume_vc"
              extraParams={{ type: 'EmailVerificationCredential' }}
              messages={{
                title: 'Provide your vc',
                scan: 'Connect your DID Wallet to sign a message',
                confirm: 'Confirm on your DID Wallet',
                success: 'vc have been checked',
              }}
            />
            <AuthButton
              button="Random Fake Badge"
              action="issue_badge"
              messages={{
                title: 'You will get a random badge',
                scan: 'Connect your DID Wallet to sign a message',
                confirm: 'Confirm on your DID Wallet',
                success: 'badge have been sent',
              }}
            />
            <AuthButton
              button="Random Fake Badge Asset"
              action="issue_badge_asset"
              messages={{
                title: 'You will get a random badge',
                scan: 'Connect your DID Wallet to sign a message',
                confirm: 'Confirm on your DID Wallet',
                success: 'badge have been sent',
              }}
            />
            <AuthButton
              button="Verify Certificate VC"
              action="consume_vc"
              extraParams={{ type: 'NFTCertificate' }}
              messages={{
                title: 'Provide your certificate',
                scan: 'Connect your DID Wallet to sign a message',
                confirm: 'Confirm on your DID Wallet',
                success: 'Certificate have been verified',
              }}
            />
            <AuthButton
              button="Verify Ticket VC"
              action="consume_vc"
              extraParams={{ type: 'NFTTicket' }}
              messages={{
                title: 'Provide your ticket',
                scan: 'Connect your DID Wallet to sign a message',
                confirm: 'Confirm on your DID Wallet',
                success: 'Ticket have been verified',
              }}
            />
            <AuthButton
              button="Verify Badge VC"
              action="consume_vc"
              extraParams={{ type: 'NFTBadge' }}
              messages={{
                title: 'Provide your badge',
                scan: 'Connect your DID Wallet to sign a message',
                confirm: 'Confirm on your DID Wallet',
                success: 'Badge have been verified',
              }}
            />
            <AuthButton
              button="Request NFT: Multiple Type"
              action="consume_vc"
              extraParams={{ type: ['NodePurchaseCredential', 'BlockletPurchaseCredential'] }}
              messages={{
                title: 'NFT Required',
                scan: 'Connect your DID Wallet to provide your NodePurchase or Blocklet Purchase NFT',
                confirm: 'Confirm on your DID Wallet',
                success: 'NFT have been verified',
              }}
            />
            <AuthButton
              button="Request VC: Optional"
              action="consume_vc"
              extraParams={{ type: ['NFTBadge'], optional: true }}
              messages={{
                title: 'Provide your vc(optional)',
                scan: 'Connect your DID Wallet to sign a message',
                confirm: 'Confirm on your DID Wallet',
                success: 'Success',
              }}
            />
            <AuthButton
              button="Claim Fake Passport"
              action="fake_passport"
              messages={{
                title: 'Claim Fake Passport',
                scan: 'Connect your DID Wallet to sign a message',
                confirm: 'Confirm on your DID Wallet',
                success: 'Passport sent',
              }}
            />
            <AuthButton
              button="Claim Target VC"
              action="claim_target_vc"
              extraParams={{ type: 'NFTCertificate' }}
              messages={{
                title: 'Provide your Fake Passport',
                scan: 'Connect your DID Wallet to sign a message',
                confirm: 'Confirm on your DID Wallet',
                success: 'Passport have been verified',
              }}
            />
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Notification Scenarios{' '}
            <Typography component="small" color="textSecondary">
              Send a notification to your wallet
            </Typography>
          </Typography>
          <div className="section__content">
            <NotificationButton type="text" className="action">
              Send text
            </NotificationButton>
            <NotificationButton type="asset" data={{ title: 'Asset', body: 'Hello Asset' }} className="action">
              Send asset
            </NotificationButton>
            <NotificationButton type="vc" data={{ title: 'VC', body: 'Hello VC' }} className="action">
              Send VC
            </NotificationButton>
            <NotificationButton type="token" data={{ title: 'Token', body: 'Hello token' }} className="action">
              Send random {token.foreign.symbol}
            </NotificationButton>
            <NotificationButton
              type="token"
              data={{ title: 'Primary Token', body: 'Hello TBA' }}
              actions={[{ name: 'primary', title: 'Launch', link: 'https://arcblock.io' }]}
              className="action">
              Send random {token.local.symbol}
            </NotificationButton>
            <NotificationButton
              type="text"
              actions={[{ name: 'launch', title: 'Launch ABT Node', link: 'https://arcblock.io' }]}
              className="action">
              Send with action
            </NotificationButton>
            <NotificationButton
              type="text"
              actions={[
                { name: 'launch', title: 'Launch', link: 'https://arcblock.io' },
                { name: 'Set', title: 'ABT', link: 'https://arcblock.io' },
                { name: 'Do What', title: 'Node', link: 'https://arcblock.io' },
                { name: 'More', title: 'More Action', link: 'https://arcblock.io' },
              ]}
              className="action">
              Send with 4 action
            </NotificationButton>
            <NotificationButton type="feed-graphic" actions={[]} className="action">
              Send Graphic Feed To Me
            </NotificationButton>
            <NotificationButton type="feed-data-tracker" actions={[]} className="action">
              Send Data Tracker Feed To Me
            </NotificationButton>
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Staking Scenarios{' '}
            <Typography component="small" color="textSecondary">
              Staking Tokens or Assets
            </Typography>
          </Typography>
          <div className="section__content">
            <AuthButton
              button={`Stake Token: ${token.local.symbol}`}
              action="stake"
              extraParams={{ type: 'StakeLocalToken' }}
              messages={{
                title: `Stake ${token.local.symbol}`,
                scan: 'Connect your DID Wallet to complete the staking',
                confirm: 'Confirm on your DID Wallet',
                success: 'Token is Locked',
              }}
            />
            <AuthButton
              button={`Revoke Stake: ${token.local.symbol}`}
              action="revoke-stake"
              extraParams={{ type: 'RevokeLocalToken' }}
              messages={{
                title: 'Revoke Stake',
                scan: 'Connect your DID Wallet to complete the transaction',
                confirm: 'Confirm on your DID Wallet',
                success: 'Token is released',
              }}
            />
            <AuthButton
              button={`Stake Token: ${token.foreign.symbol}`}
              action="stake"
              extraParams={{ type: 'StakeForeignToken' }}
              messages={{
                title: `Stake ${token.foreign.symbol}`,
                scan: 'Connect your DID Wallet to complete the staking',
                confirm: 'Confirm on your DID Wallet',
                success: 'Token is Locked',
              }}
            />
            <AuthButton
              button={`Revoke Stake: ${token.foreign.symbol}`}
              action="revoke-stake"
              extraParams={{ type: 'RevokeForeignToken' }}
              messages={{
                title: 'Revoke Stake',
                scan: 'Connect your DID Wallet to complete the transaction',
                confirm: 'Confirm on your DID Wallet',
                success: 'Token is released',
              }}
            />
            <AuthButton
              button="Stake NFT"
              action="stake"
              extraParams={{ type: 'StakeNFT' }}
              messages={{
                title: 'Stake NFT',
                scan: 'Connect your DID Wallet to complete the transaction',
                confirm: 'Confirm on your DID Wallet',
                success: 'NFT is staked',
              }}
            />
            <AuthButton
              button="Revoke Stake NFT"
              action="revoke-stake"
              extraParams={{ type: 'RevokeNFT' }}
              messages={{
                title: 'Revoke Stake NFT',
                scan: 'Connect your DID Wallet to complete the transaction',
                confirm: 'Confirm on your DID Wallet',
                success: 'NFT is released',
              }}
            />
            <ClaimButton
              button="Claim Revoked Stake"
              action="claim-stake"
              extraParams={{}}
              messages={{
                title: 'Claim Revoked Stake',
                scan: 'Connect your DID Wallet to complete the claim',
                confirm: 'Confirm on your DID Wallet',
                success: 'Claim Success',
              }}
            />
          </div>
        </section>

        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Creating X{' '}
            <Typography component="small" color="textSecondary">
              tokens/assets/factories
            </Typography>
          </Typography>
          <div className="section__content">
            <AuthButton
              button="Create Test Token"
              action="create"
              extraParams={{ type: 'token' }}
              messages={{
                title: 'Create Test Token',
                scan: 'Connect your DID Wallet to create a test token with 10000 totalSupply',
                confirm: 'Confirm on your DID Wallet',
                success: 'Token created',
              }}
            />
            <AuthButton
              button="Create Test Factory"
              action="create"
              extraParams={{ type: 'factory' }}
              messages={{
                title: 'Create Test Factory',
                scan: 'Connect your DID Wallet to create a test factory',
                confirm: 'Confirm on your DID Wallet',
                success: 'Factory created',
              }}
            />
            <AuthButton
              button="Create Test Asset"
              action="create"
              extraParams={{ type: 'asset' }}
              messages={{
                title: 'Create Test Asset',
                scan: 'Connect your DID Wallet to create a test asset',
                confirm: 'Confirm on your DID Wallet',
                success: 'Asset created',
              }}
            />
            <AuthButton
              button="Create NFT: SVG"
              action="create"
              extraParams={{ type: 'nft', nftDisplay: 'svg' }}
              messages={{
                title: 'Create NFT with SVG Display',
                scan: 'Connect your DID Wallet to create a test asset',
                confirm: 'Confirm on your DID Wallet',
                success: 'NFT created',
              }}
            />
            <AuthButton
              button="Create NFT: URL"
              action="create"
              extraParams={{ type: 'nft', nftDisplay: 'url' }}
              messages={{
                title: 'Create NFT with URL display',
                scan: 'Connect your DID Wallet to create a test asset',
                confirm: 'Confirm on your DID Wallet',
                success: 'NFT created',
              }}
            />
            <AuthButton
              button="Create NFT: Data"
              action="create"
              extraParams={{ type: 'nft', nftDisplay: 'uri' }}
              messages={{
                title: 'Create NFT with Data Display',
                scan: 'Connect your DID Wallet to create a test asset',
                confirm: 'Confirm on your DID Wallet',
                success: 'NFT created',
              }}
            />
          </div>
        </section>

        {!browser.wallet && (
          <section className="section">
            <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
              Do not have DID Wallet?
            </Typography>
            <div className="section__content">
              <div style={{ padding: 24, background: '#44cdc6', color: 'rgb(255, 255, 255)' }}>
                <WalletDownload
                  layout={browser.mobile.any ? 'vertical' : 'horizontal'}
                  title="Make sure you have your phone handy with the DID Wallet downloaded."
                />
              </div>
            </div>
          </section>
        )}
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
        @media (max-width: ${props => props.theme.breakpoints.values.sm}px) {
          margin-right: 0;
        }
        width: 100%;
        max-width: 360px;
        display: block;
      }
    }
  }
`;
