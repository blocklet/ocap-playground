# Wallet Playground

DID Wallet Playground Blocklet

## Run and debug in the cloud with Gitpod

Click the "Open in Gitpod" button, Gitpod will start Blocklet Server and the blocklet.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/blocklet/ocap-playground)

## Run and debug in local

```shell
pnpm i @blocklet/cli -g
git clone git@github.com:blocklet/ocap-playground.git
cd ocap-playground
cp .env.bac .env
pnpm i
blocklet server init -f --mode debug
blocklet server start
blocklet dev
```

## License

The code is licensed under the Apache 2.0 license found in the
[LICENSE](LICENSE) file.
