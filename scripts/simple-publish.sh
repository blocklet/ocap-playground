git checkout master

# publish
VERSION=$(cat version | awk '{$1=$1;print}')
lerna run build --scope @arcblock/*
lerna publish $VERSION --yes
