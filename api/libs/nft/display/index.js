const getNftName = ({ type }) => {
  const names = {
    NodePurchaseCredential: 'ABT Node Purchase Receipt',
    NodeOwnershipCredential: 'Proof of ABT Node Ownership',
    BlockletPurchaseCredential: 'Blocklet Purchase Receipt',
    EndpointTestCredential: 'Endpoint Test NFT',
    TokenInputTestCredential: 'Token Input Test NFT',
    AssetInputTestCredential: 'Asset Input Test NFT',
  };

  const key = Object.keys(names).find(x => type.includes(x));
  return names[key];
};

const create = (
  vc,
  data
) => `<svg width="100%" height="100%" viewBox="0 0 374 130" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect rx="4" ry="4" width="374" height="130" stroke="none" fill="#2f3036" />
  <svg x="3" y="3" width="368" height="124" fill="none">
    <defs>
      <linearGradient x1="0%" y1="93.7397076%" x2="100%" y2="93.7397076%" id="linearGradient-1">
        <stop stop-color="#6A5A53" offset="0%"></stop>
        <stop stop-color="#A59D8B" offset="22.7961858%"></stop>
        <stop stop-color="#877B6D" offset="49.3379967%"></stop>
        <stop stop-color="#ADA593" offset="74.6107939%"></stop>
        <stop stop-color="#6A5A53" offset="100%"></stop>
      </linearGradient>
    </defs>
    <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linejoin="round">
      <g id="Card/Certificate" transform="translate(-3.000000, -3.000000)" stroke="url(#linearGradient-1)">
        <path
          d="M363,4 C363,7.86599325 366.134007,11 370,11 L370,119 L370,119 C366.134007,119 363,122.134007 363,126 L11,126 L11,126 C11,122.134007 7.86599325,119 4,119 L4,11 L4,11 C7.86599325,11 11,7.86599325 11,4 L363,4 L363,4 Z"
          id="decor-line"></path>
      </g>
    </g>
  </svg>
  <text x="187" y="20" text-anchor="middle" font-size="10" font-family="Arial,Helvetica,sans-serif" fill="#4E6AF6">
    ${getNftName(vc)}
  </text>
  <svg x="146" y="24" width="82" height="1">
    <defs>
      <linearGradient x1="0%" y1="0%" x2="100%" y2="0%" id="linearGradient-1">
        <stop stop-color="#AF957E" offset="0%"></stop>
        <stop stop-color="#A8A08E" offset="28.1540329%"></stop>
        <stop stop-color="#80756B" offset="53.5684122%"></stop>
        <stop stop-color="#A59D8B" offset="77.9798353%"></stop>
        <stop stop-color="#AA907B" offset="100%"></stop>
      </linearGradient>
    </defs>
    <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round">
      <g id="Card/Certificate" transform="translate(-146.000000, -32.000000)" stroke="url(#linearGradient-1)">
        <line x1="146" y1="32" x2="228" y2="33" id="line"></line>
      </g>
    </g>
  </svg>
  <text x="187" y="36" text-anchor="middle" font-size="8" font-family="Arial,Helvetica,sans-serif" fill="white">
    Issued By ${data.issuer}
  </text>
  <text x="187" y="60" text-anchor="middle" font-size="10" font-family="Arial,Helvetica,sans-serif" fill="white">
    Owned by ${data.owner}
  </text>
  <text x="187" y="80" text-anchor="middle" font-size="8" font-family="Arial,Helvetica,sans-serif" fill="white">
    ${data.description}
  </text>
  <text x="187" y="100" text-anchor="middle" font-size="8" font-family="Arial,Helvetica,sans-serif" fill="white">
    ${data.date}
  </text>
  <svg x="343" y="95" width="45" height="52">
    <g fill="none" fill-rule="evenodd" stroke="#44cdc6">
      <path
        d="M.5 13.077L22.15.577l21.651 12.5v25l-21.65 12.5L.5 38.077zM22.15.577v50M.5 13.077l43.301 25M.5 38.077l43.301-25" transform="scale(0.5)" />
      <path d="M22.15 38.077l10.826-6.25-10.825-18.75-10.825 18.75z" transform="scale(0.5)" />
    </g>
  </svg>
  <svg x="10" y="10" width="99" height="18">
    <path fill="#44cdc6" fill-rule="evenodd"
      d="M6.5.053h2.864L16.028 18h-2.114l-1.391-3.795H3.504L2.14 18H0L6.5.053zm1.474 1.481L4.04 12.563h7.895L7.975 1.534zm14.44 3.542c1.27 0 2.198.296 2.78.892.58.597.871 1.52.871 2.765v.36c0 .117-.008.245-.026.385h-1.826c.018-.14.027-.292.027-.452v-.48c0-.766-.186-1.283-.551-1.55-.367-.266-.916-.4-1.65-.4-.968 0-1.698.24-2.189.723-.493.48-.738 1.208-.738 2.187v8.308h-1.88V5.341h1.824l-.079 1.443c.376-.614.863-1.053 1.463-1.316a4.868 4.868 0 0 1 1.974-.392zM35.95 15.903c.501-.328.752-1.205.752-2.63h1.852c0 1.924-.403 3.178-1.208 3.765-.806.589-2.158.882-4.055.882-2.65 0-4.24-.538-4.766-1.616-.529-1.076-.793-2.781-.793-5.114 0-2.118.367-3.645 1.102-4.581.732-.934 2.209-1.401 4.43-1.401 1.378 0 2.569.221 3.572.665 1.002.446 1.503 1.497 1.503 3.153v.188a.234.234 0 0 0-.027.106v.106h-1.826c0-1.12-.228-1.851-.685-2.188-.455-.34-1.23-.507-2.322-.507-1.665 0-2.713.259-3.142.782-.43.524-.646 1.67-.646 3.44V12.2c0 1.4.161 2.448.485 3.15.322.7 1.297 1.048 2.926 1.048 1.397 0 2.346-.165 2.848-.495zm15.87-.318c.606-.328.912-1.263.912-2.805 0-.924-.147-1.69-.444-2.302-.294-.611-1.007-.917-2.133-.917H43.065v6.516h5.528c1.543 0 2.617-.165 3.226-.492zm-8.754-13.85v6.036h5.665c1.325 0 2.239-.214 2.737-.643.503-.428.755-1.288.755-2.575 0-1.09-.192-1.834-.577-2.226-.385-.394-1.116-.591-2.19-.591h-6.39zM52 8.466c1.185.322 1.956.816 2.314 1.482.359.67.54 1.581.54 2.739 0 1.6-.325 2.858-.97 3.764-.647.909-1.874 1.363-3.686 1.363H41.05V0h8.62c1.592 0 2.759.312 3.503.934.744.624 1.115 1.78 1.115 3.473 0 1.014-.129 1.855-.386 2.522-.258.669-.89 1.181-1.903 1.536zm5.43 9.348V.001h1.907v17.812H57.43zm13.374-6.168v-.708c0-1.539-.141-2.636-.426-3.297-.284-.658-1.191-.99-2.718-.99h-.401c-1.617 0-2.625.25-3.025.75-.399.5-.599 1.632-.599 3.4V12.822c0 .206.008.407.024.602a9.48 9.48 0 0 0 .216 1.474c.106.465.275.822.505 1.072.196.179.435.302.72.373.283.072.586.116.905.135h1.254c1.083 0 1.914-.151 2.492-.456.577-.302.9-1.043.972-2.22a18.338 18.338 0 0 0 .054-1.447c.015-.233.027-.47.027-.71zm-3.786-6.518c2.399 0 3.956.414 4.672 1.243.717.828 1.074 2.418 1.074 4.766 0 2.048-.219 3.704-.657 4.966C71.668 17.367 70.16 18 67.581 18c-2.237 0-3.782-.347-4.632-1.042-.85-.694-1.275-2.205-1.275-4.54v-1.174c0-2.12.318-3.669.954-4.646.635-.98 2.099-1.471 4.39-1.471zm16.434 10.776c.501-.328.752-1.205.752-2.63h1.853c0 1.924-.403 3.178-1.209 3.765-.804.589-2.157.882-4.054.882-2.648 0-4.24-.538-4.767-1.616-.528-1.076-.79-2.781-.79-5.114 0-2.118.365-3.645 1.1-4.581.732-.934 2.21-1.401 4.43-1.401 1.377 0 2.568.221 3.571.665 1.003.446 1.504 1.497 1.504 3.153v.188a.232.232 0 0 0-.026.106v.106H83.99c0-1.12-.229-1.851-.686-2.188-.455-.34-1.23-.507-2.323-.507-1.665 0-2.712.259-3.142.782-.43.524-.643 1.67-.643 3.44V12.2c0 1.4.16 2.448.482 3.15.324.7 1.298 1.048 2.927 1.048 1.397 0 2.346-.165 2.847-.495zm9.236-4.82L99 17.813h-2.47l-5.317-6.01h-.752v6.01h-1.907V0h1.907v10.362h.752l4.512-5.02h2.309l-5.346 5.741z" transform="scale(0.5)" />
  </svg>
</svg>`;

module.exports = { create };
