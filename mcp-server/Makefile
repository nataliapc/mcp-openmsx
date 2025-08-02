# Makefile for MCP-openMSX project
.PHONY: all clean

COL_WHITE = \e[1;37m
COL_ORANGE = \e[1;38:5:208m
COL_RESET = \e[0m


npm_install:
	@echo "$(COL_WHITE)#### Installing npm dependencies...$(COL_RESET)"
	npm install

build: npm_install
	@echo "$(COL_WHITE)#### Building MCP-openMSX project...$(COL_RESET)"
	npm ci
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

inspector: build
	@echo "$(COL_WHITE)#### Inspecting MCP-openMSX project...$(COL_RESET)"
	DANGEROUSLY_OMIT_AUTH=true npx @modelcontextprotocol/inspector node dist/server.js

publish: build pack
	@echo "$(COL_WHITE)#### Publishing MCP-openMSX project...$(COL_RESET)"
	npm pack --dryrun
	npm publish --access public
	npm version patch

info:
	@echo "$(COL_WHITE)#### MCP-openMSX published packet information$(COL_RESET)"
	npm view @nataliapc/mcp-openmsx

clean:
	rm -rf node_modules
	rm -rf dist
	rm -f package-lock.json
	rm -f README.md
	rm -f LICENSE
	rm -f *.tgz

#Checks

depcheck:
	@echo "$(COL_ORANGE)## depcheck...$(COL_RESET)"
	@depcheck || true

outdated:
	@echo "$(COL_ORANGE)## npm outdated...$(COL_RESET)"
	@npm outdated || true

npq:
	@echo "$(COL_ORANGE)## npq...$(COL_RESET)"
	@npq --dry-run || true

check: depcheck outdated npq
