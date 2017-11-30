#!/usr/bin/env bash

rm -r release/

babel ./Util --out-dir ./release/Util

babel ./mlop-typings --out-dir ./release/mlop-typings
cp -r ./mlop-typings/data ./release/mlop-typings/data

babel ./commit-file-jshint --out-dir ./release/commit-file-jshint

babel ./angular-eject --out-dir ./release/angular-eject
cp -r ./angular-eject/data ./release/angular-eject/data

cp bin/* release/

cat package.json | jq '{name: .name, version: .version, dependencies: .dependencies, bin: {typings: "./typings",diffj: "./diffj"}}' > release/package.json