# Makefile for MCP-openMSX project
.PHONY: all npm_install build run_stdio run_http pack publish info clean embeddings query update-mcp-docs

SERVER_DIR = mcp-server
MAKE = make -s --no-print-directory -C $(SERVER_DIR)

VECTOR_DIR = vector-db
MAKE_VECTOR = make -s --no-print-directory -C $(VECTOR_DIR)


npm_install:
	@$(MAKE) npm_install

build:
	@$(MAKE) build

run_stdio:
	@$(MAKE) run_stdio

run_http:
	@$(MAKE) run_http

pack:
	@$(MAKE) pack

inspector: build
	@$(MAKE) inspector

publish:
	@$(MAKE) publish

info:
	@$(MAKE) info

clean:
	@$(MAKE) clean

# Create embeddings for VectorDB
embeddings:
	@$(MAKE_VECTOR) embeddings

# Querying VectorDB
query:
	@$(MAKE_VECTOR) query

# UpdateMCP documentation
update-mcp-docs:
	@echo "Updating MCP documentation..."
	# Assuming the documentation is in a specific directory
	curl -o .github/instructions/mcp_specification.instructions.md https://modelcontextprotocol.io/specification/2025-06-18.md
	curl -o .github/instructions/mcp_introduction.instructions.md https://modelcontextprotocol.io/introduction.md
	curl -o .github/instructions/mcp_typescript.instructions.md https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/README.md
