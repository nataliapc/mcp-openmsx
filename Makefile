# Makefile for MCP-openMSX project
.PHONY: all update-mcp-docs

SERVER_DIR = mcp-server

npm_install:
	@echo "#### Installing npm dependencies..."
	cd $(SERVER_DIR) && npm install

build: npm_install
	@echo "#### Building MCP-openMSX project..."
	cd $(SERVER_DIR) && npm run build

run_stdio: build
	@echo "#### Running MCP-openMSX project with stdio..."
	cd $(SERVER_DIR) && node dist/server.js

run_http: build
	@echo "#### Running MCP-openMSX project with HTTP server..."
	cd $(SERVER_DIR) && MCP_TRANSPORT=http node dist/server.js

pack: build
	@echo "#### Packing MCP-openMSX project..."
	cp README.md $(SERVER_DIR)/
	cp LICENSE $(SERVER_DIR)/
	cd $(SERVER_DIR) && npm pack

publish: build pack
	@echo "#### Publishing MCP-openMSX project..."
	cd $(SERVER_DIR) && npm pack --dryrun
	cd $(SERVER_DIR) && npm publish --access public
	cd $(SERVER_DIR) && npm version patch

info:
	@echo "#### MCP-openMSX published packet information"
	cd $(SERVER_DIR) && npm view @nataliapc/mcp-openmsx

clean:
	@echo "#### Cleaning up build artifacts..."
	rm -rf $(SERVER_DIR)/node_modules
	rm -rf $(SERVER_DIR)/dist
	rm -f $(SERVER_DIR)/package-lock.json
	rm -f $(SERVER_DIR)/README.md
	rm -f $(SERVER_DIR)/LICENSE
	rm -f $(SERVER_DIR)/*.tgz

#UpdateMCP documentation
update-mcp-docs:
	@echo "Updating MCP documentation..."
	# Assuming the documentation is in a specific directory
	curl -o .github/instructions/mcp_specification.instructions.md https://modelcontextprotocol.io/specification/2025-03-26.md
	curl -o .github/instructions/mcp_introduction.instructions.md https://modelcontextprotocol.io/introduction.md
	curl -o .github/instructions/mcp_typescript.instructions.md https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/README.md
