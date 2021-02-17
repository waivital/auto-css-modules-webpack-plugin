#!/bin/bash

set -e

if [[ "$1" = "clean" ]]; then
  rm __tests__/.SETUP
  exit 0
fi

if [ -f "__tests__/.SETUP" ]; then
  exit 0
fi

pushd __tests__/fixtures/webpack4 && npm install && popd
pushd __tests__/fixtures/webpack5 && npm install && popd

touch __tests__/.SETUP
