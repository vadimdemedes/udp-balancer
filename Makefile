SRC = index.js $(wildcard src/*.js)

default:
	@echo "Default task is not set."

include node_modules/make-lint-es6/index.mk

