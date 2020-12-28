/* eslint-disable func-names */
export default function () {
  return window.localStorage.getItem('wallet_url') || 'https://web.abtwallet.io/';
}
