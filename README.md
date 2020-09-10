# wallet-playground

[![Netlify Status](https://api.netlify.com/api/v1/badges/b9dda415-1d60-4745-9129-a0e858d1d33d/deploy-status)](https://app.netlify.com/sites/abt-wallet/deploys)

ABT Wallet Playground

## Usage

```shell
git clone git@github.com:ArcBlock/wallet-playground.git
cd wallet-playground
yarn
yarn start
```

### Configuration

Checkout `.env` file:

```config
SKIP_PREFLIGHT_CHECK=true

# server only
MONGO_URI="mongodb://127.0.0.1:27017/wallet-playground"
APP_TOKEN_SECRET="c196792a8a1"
APP_TOKEN_TTL="1d"
APP_SK="0x2079dc31eada3064"
APP_PORT="3030"

# ==========================
# both server and client
# =========================

# if we want to start a dapp with zinc chain
REACT_APP_CHAIN_ID="playground"
REACT_APP_CHAIN_HOST="http://47.104.23.85:8213/api"
REACT_APP_ASSET_CHAIN_ID="zinc-2019-05-17"
REACT_APP_ASSET_CHAIN_HOST="https://zinc.abtnetwork.io/api"

REACT_APP_APP_NAME="Wallet Playground"
REACT_APP_APP_DESCRIPTION="An simple playground that shows the potential of ABT Wallet V2"
REACT_APP_APP_ID="zNKrrPHwBnyVoMVZ6ZFtpqnLGsCQXwisEu6j"
REACT_APP_BASE_URL="http://192.168.43.94:3030"
REACT_APP_API_PREFIX=""
```
