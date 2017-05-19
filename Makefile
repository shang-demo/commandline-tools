.PHONY: all test clean static
push:
	@ sh config/push.sh
deploy:
	@ sh babel.sh
	@ sh npm-link.sh