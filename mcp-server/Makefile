# Makefile for MCP-openMSX project
.PHONY: all clean

COL_WHITE = \e[1;37m
COL_RESET = \e[0m


npm_install:
	@echo "$(COL_WHITE)#### Installing npm dependencies...$(COL_RESET)"
	npm install

build: npm_install
	@echo "$(COL_WHITE)#### Building MCP-openMSX project...$(COL_RESET)"
	npm run build

run_stdio: build
	@echo "$(COL_WHITE)#### Running MCP-openMSX project with stdio...$(COL_RESET)"
	node dist/server.js

run_http: build
	@echo "$(COL_WHITE)#### Running MCP-openMSX project with HTTP server...$(COL_RESET)"
	MCP_TRANSPORT=http node dist/server.js

pack: build
	@echo "$(COL_WHITE)#### Packing MCP-openMSX project...$(COL_RESET)"
	cp ../README.md .
	cp ../LICENSE .
	npm pack

publish: build pack
	@echo "$(COL_WHITE)#### Publishing MCP-openMSX project...$(COL_RESET)"
	npm pack --dryrun
	npm publish --access public
	npm version patch

info:
	@echo "$(COL_WHITE)#### MCP-openMSX published packet information$(COL_RESET)"
	npm view @nataliapc/mcp-openmsx

clean:
	@echo "$(COL_WHITE)#### Cleaning up build artifacts...$(COL_RESET)"
	rm -rf node_modules
	rm -rf dist
	rm -f package-lock.json
	rm -f README.md
	rm -f LICENSE
	rm -f *.tgz
