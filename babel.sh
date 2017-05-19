#!/usr/bin/env bash

babel ./Util --out-dir ./.babel-translate/Util

babel ./mlop-typings --out-dir ./.babel-translate/mlop-typings
cp -r ./mlop-typings/data ./.babel-translate/mlop-typings/data

babel ./commit-file-jshint --out-dir ./.babel-translate/commit-file-jshint