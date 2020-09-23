VERSION=$(cat version | awk '{$1=$1;print}')
echo "publish version ${VERSION}"

git config --local user.name "wangshijun"
git config --local user.email "wangshijun2010@gmail.com"

make release
npm config set '//registry.npmjs.org/:_authToken' "${NPM_TOKEN}"
npm install -g @abtnode/cli

echo "publishing wallet demo blocklet..."
npm run bundle
npm publish _blocklet

# deploy to remote ABT Node
if [ "${ALIYUN_ENDPOINT}" != "" ]; then
  abtnode deploy . --endpoint ${ALIYUN_ENDPOINT} --access-key ${ALIYUN_ACCESS_KEY} --access-secret ${ALIYUN_ACCESS_SECRET} --skip-hooks
  echo "deploy to ${ALIYUN_ENDPOINT} success"
fi
if [ "${AWS_ENDPOINT}" != "" ]; then
  abtnode deploy . --endpoint ${AWS_ENDPOINT} --access-key ${AWS_ACCESS_KEY} --access-secret ${AWS_ACCESS_SECRET} --skip-hooks
  echo "deploy to ${ALIYUN_ENDPOINT} success"
fi

# trigger ArcBlock/blocklets repo release
echo "trigger ArcBlock/blocklets repo release"
gem install travis
.makefiles/trigger_registry_build.sh