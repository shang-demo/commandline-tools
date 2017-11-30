.PHONY: all test clean static
push:
	@ sh config/push.sh
build:
	@ sh babel.sh
deploy:
	@ sh babel.sh
	@ cp npm-link.sh ./release/
	@ cd release && sh npm-link.sh
