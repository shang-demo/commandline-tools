#!/usr/bin/env bash

rm -r release/

# Util
babel ./Util --out-dir ./release/Util

# mlop-typings
babel ./mlop-typings --out-dir ./release/mlop-typings
cp -r ./mlop-typings/data ./release/mlop-typings/data

# commit-file-jshint
babel ./commit-file-jshint --out-dir ./release/commit-file-jshint

# clone
babel ./mlop-clone --out-dir ./release/mlop-clone

#babel ./angular-eject --out-dir ./release/angular-eject
#cp -r ./angular-eject/data ./release/angular-eject/data

# bin
cp bin/* release/

cat package.json | jq '{name: .name, version: .version, dependencies: .dependencies, bin: {typings: "./typings",diffj: "./diffj", clone: "./clone"}}' > release/package.json