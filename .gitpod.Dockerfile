FROM gitpod/workspace-full

ENV ABT_NODE_TEST_DOCKER=1
ENV PATH=/home/linuxbrew/.linuxbrew/bin:$PATH
ENV ABT_NODE_HTTP_PORT=8080

RUN brew install nginx && npm install -g lerna @blocklet/cli
