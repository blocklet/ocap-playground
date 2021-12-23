# Wallet Playground

DID Wallet Playground Blocklet

## Install on my Blocklet Server

[![Install on my Blocklet Server](https://raw.githubusercontent.com/blocklet/development-guide/main/assets/launch_on_blocklet_server.svg)](https://install.arcblock.io/?action=blocklet-install&meta_url=https%3A%2F%2Fgithub.com%2Fblocklet%2Focap-playground%2Freleases%2Fdownload%2Fv0.9.0%2Fblocklet.json)

## Run and debug in the cloud with Gitpod

Click the "Open in Gitpod" button, Gitpod will start Blocklet Server and the blocklet.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/blocklet/ocap-playground)

## Run and debug in local

```shell
yarn global add @blocklet/cli
git clone git@github.com:blocklet/ocap-playground.git
cd ocap-playground
cp .env.bac .env
yarn
blocklet server init -f --mode debug
blocklet server start
blocklet dev
```

## License

The code is licensed under the Apache 2.0 license found in the
[LICENSE](LICENSE) file.
