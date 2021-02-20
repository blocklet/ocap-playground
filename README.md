# Wallet Playground

ABT Wallet Playground Blocklet

## Install on my ABT Node

[![Install on my ABT Node](https://raw.githubusercontent.com/blocklet/development-guide/main/assets/install_on_abtnode.svg)](https://install.arcblock.io/?action=blocklet-install&meta_url=https%3A%2F%2Fgithub.com%2Fblocklet%2Fwallet-playground%2Freleases%2Fdownload%2F1.12.2%2Fblocklet.json)

## Run and debug in the cloud with Gitpod
Click the "Open in Gitpod" button, Gitpod will start ABT Node and the blocklet.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/blocklet/wallet-playground)

## Run and debug in local

```shell
yarn global add @abtnode/cli
git clone git@github.com:blocklet/wallet-playground.git
cd wallet-playground
cp .env.bac .env
yarn
abtnode init -f --mode debug
abtnode start
blocklet dev
```

## License

The code is licensed under the Apache 2.0 license found in the
[LICENSE](LICENSE) file.
