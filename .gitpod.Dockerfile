FROM gitpod/workspace-full

RUN brew install nginx && \
  echo PATH=/home/linuxbrew/.linuxbrew/bin:$PATH >> ~/.bashrc && \
  npm install -g lerna @abtnode/cli@1.0.23