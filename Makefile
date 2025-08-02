# Makefile for MCP-openMSX project
.PHONY: all npm_install build run_stdio run_http pack publish info clean embeddings query update-mcp-docs

COL_WHITE = \e[1;37m
COL_ORANGE = \e[1;38:5:208m
COL_RESET = \e[0m

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
	@echo "$(COL_WHITE)#### Updating MCP documentation...$(COL_RESET)"
	# Assuming the documentation is in a specific directory
	curl -o .github/instructions/mcp_specification.instructions.md https://modelcontextprotocol.io/specification/2025-06-18.md
	curl -o .github/instructions/mcp_introduction.instructions.md https://modelcontextprotocol.io/introduction.md
	curl -o .github/instructions/mcp_typescript.instructions.md https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/README.md

# Checks
depcheck:
	@echo "$(COL_WHITE)#### Checking MCP-SERVER depcheck...$(COL_RESET)"
	@$(MAKE) depcheck
	@echo "$(COL_WHITE)#### Checking VECTOR-DB depcheck...$(COL_RESET)"
	@$(MAKE_VECTOR) depcheck

outdated:
	@echo "$(COL_WHITE)#### Checking MCP-SERVER outdated...$(COL_RESET)"
	@$(MAKE) outdated
	@echo "$(COL_WHITE)#### Checking VECTOR-DB outdated...$(COL_RESET)"
	@$(MAKE_VECTOR) outdated

npq:
	@echo "$(COL_WHITE)#### Checking MCP-SERVER npq...$(COL_RESET)"
	@$(MAKE) npq
	@echo "$(COL_WHITE)#### Checking VECTOR-DB npq...$(COL_RESET)"
	@$(MAKE_VECTOR) npq

check:
	@echo "$(COL_WHITE)#### Checking MCP-SERVER dependencies...$(COL_RESET)"
	@$(MAKE) check
	@echo "$(COL_WHITE)#### Checking VECTOR-DB dependencies...$(COL_RESET)"
	@$(MAKE_VECTOR) check
