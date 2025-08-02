# Makefile for MCP-openMSX project
.PHONY: all install embeddings

COL_WHITE = \e[1;37m
COL_ORANGE = \e[1;38:5:208m
COL_RESET = \e[0m

SERVER_DIR = mcp-server
MAKE = make -s --no-print-directory -C $(SERVER_DIR)

install:
	@npm ci

embeddings:
	@echo "$(COL_WHITE)#### Creating embeddings...$(COL_RESET)"
	npx tsx generate_embeddings.ts

query:
	@echo "$(COL_WHITE)#### Querying VectorDB...$(COL_RESET)"
	#request the user to enter a query
	@read -p "Enter your query: " query; \
	echo "Query: $$query"; \
	npx tsx query_vectra.ts "$$query"

# Checks

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
