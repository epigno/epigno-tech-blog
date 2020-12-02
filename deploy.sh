#!/usr/bin/env bash

set -eux

rm -r dist
yarn && yarn build && yarn generate
if [ ! -d 'epigno.github.io' ]; then
	git clone git@github.com:epigno/epigno.github.io.git
fi
cd epigno.github.io
git ls-files | xargs git rm
cp -rav ../dist/. .
git add . && git commit -m Update

set +x

read -r -p "Push (y/n)?" CONT
if [ "$CONT" = "y" ]; then
	git push
fi
