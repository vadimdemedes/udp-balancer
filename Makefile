SRC = $(wildcard src/*.js)
LIB = $(SRC:src/%.js=lib/%.js)

lib: $(LIB)
lib/%.js: src/%.js
	@mkdir -p $(@D)
	./node_modules/.bin/babel -L all $< -o $@

build:
	docker build -t vdemedes/udp-balancer .

push:
	docker push vdemedes/udp-balancer

include node_modules/make-lint-es6/index.mk
