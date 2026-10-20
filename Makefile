# Builds and tests run inside Docker. See CLAUDE.md for how the image is chosen.
IMAGE := node:24.21.0-alpine3.24@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1

# Run as the host user so files written to the project aren't owned by root.
DOCKER_RUN := docker run --rm --user "$$(id -u):$$(id -g)" -e HOME=/tmp \
	-v "$(CURDIR)":/app -w /app $(IMAGE)

# Project files that don't belong in the packaged addon.
BUILD_IGNORE := test CLAUDE.md Makefile README.md CODEOWNERS \
	package.json package-lock.json dist twitch_ad_page.txt

.PHONY: all install test build clean

all: test build

install: node_modules

node_modules: package.json package-lock.json
	$(DOCKER_RUN) npm ci
	touch node_modules

test: node_modules
	$(DOCKER_RUN) npm test

# Packages the addon into web-ext-artifacts/.
build: node_modules
	$(DOCKER_RUN) npx web-ext build --overwrite-dest --ignore-files $(BUILD_IGNORE)

clean:
	rm -rf node_modules web-ext-artifacts
