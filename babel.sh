#!/usr/bin/env bash

rm -r .babel-translate/

babel ./Util --out-dir ./.babel-translate/Util

babel ./mlop-typings --out-dir ./.babel-translate/mlop-typings
cp -r ./mlop-typings/data ./.babel-translate/mlop-typings/data

babel ./commit-file-jshint --out-dir ./.babel-translate/commit-file-jshint

babel ./angular-eject --out-dir ./.babel-translate/angular-eject
cp -r ./angular-eject/data ./.babel-translate/angular-eject/data
