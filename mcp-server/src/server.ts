#!/usr/bin/env node
/**
 * MCP openMSX Server
 * 
 * Model Context Protocol server that manages openMSX emulator instances
 * through TCL commands via stdio.
 * 
 * @package @nataliapc/mcp-openmsx
 * @author Natalia Pujol Cremades (@nataliapc)
 * @license GPL2
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "node:crypto";
import express, { Request, Response } from "express";
import path from "path";
import { createRequire } from 'module';
import { openMSXInstance } from "./openmsx.js";
import { VectorDB } from "./vectordb.js";
import { detectOpenMSXShareDir } from "./utils.js";
import { registerTools } from "./server_tools.js";
import { registerResources } from "./server_resources.js";
import { registerPrompts } from "./server_prompts.js";


// Dynamically obtain PACKAGE_VERSION from package.json at runtime
const require = createRequire(import.meta.url);
export const PACKAGE_VERSION = require('../package.json').version;

const resourcesDir = path.join(path.dirname(new URL(import.meta.url).pathname), "../resources");
const vectorDbDir = path.join(path.dirname(new URL(import.meta.url).pathname), "../vector-db");

// Defaults for openMSX paths
export interface EmuDirectories {
	OPENMSX_SHARE_DIR: string;
	OPENMSX_EXECUTABLE: string;
	OPENMSX_REPLAYS_DIR: string;
	OPENMSX_SCREENSHOT_DIR: string;
	OPENMSX_SCREENDUMP_DIR: string;
	MACHINES_DIR: string;
	EXTENSIONS_DIR: string;
}

export const emuDirectories: EmuDirectories = {
	OPENMSX_SHARE_DIR: '',
	OPENMSX_EXECUTABLE: 'openmsx',
	OPENMSX_REPLAYS_DIR: '',
	OPENMSX_SCREENSHOT_DIR: '',
	OPENMSX_SCREENDUMP_DIR: '',
	MACHINES_DIR: '',
	EXTENSIONS_DIR: '',
};

// ============================================================================
// Cleanup handlers for graceful shutdown of MCP server
// Ensure openMSX emulator is closed when MCP server stops

let isShuttingDown = false;

async function gracefulShutdown(exitCode: number = 0)
{
	if (isShuttingDown) return;
	isShuttingDown = true;
	try {
		// Try async close first
		await Promise.race([
			openMSXInstance.emu_close(),
			new Promise(resolve => setTimeout(resolve, 2000)) // 2 second timeout
		]);
	} catch (error) {
		// If async close fails or times out, force close
		openMSXInstance.forceClose();
	}
	// Give a moment for cleanup to complete
	setTimeout(() => {
		process.exit(exitCode);
	}, 100);
}

// Handle process termination signals
process.on('SIGINT', () => gracefulShutdown(0));
process.on('SIGTERM', () => gracefulShutdown(0));

// Handle when the transport connection is closed (more reliable for MCP)
process.on('disconnect', () => gracefulShutdown(0));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', async (error) => {
	await gracefulShutdown(1);
});

process.on('unhandledRejection', async (reason, promise) => {
	await gracefulShutdown(1);
});

// Additional cleanup when the process is about to exit
process.on('exit', () => {
	// This is synchronous only - can't use async here
	// Force close as last resort
	openMSXInstance.forceClose();
});


// ============================================================================
// Help function to display usage information
//
function showHelp() {
	console.log(`
MCP-openMSX Server v${PACKAGE_VERSION}
Model Context Protocol server for openMSX emulator automation

Usage:
  mcp-openmsx [transport]

Transport options:
  stdio    Use stdio transport (default)
  http     Use HTTP transport

Environment variables:
  OPENMSX_EXECUTABLE      Path to openMSX executable
  OPENMSX_SHARE_DIR       openMSX share directory
  OPENMSX_SCREENSHOT_DIR  Screenshot output directory
  OPENMSX_SCREENDUMP_DIR  Screen dump output directory
  OPENMSX_REPLAYS_DIR     Replay output directory
  MCP_HTTP_PORT           HTTP server port (default: 3000)

Examples:
  mcp-openmsx                    # stdio transport
  mcp-openmsx http               # HTTP transport
  MCP_TRANSPORT=http mcp-openmsx # HTTP via environment
`);
}


// ============================================================================
// Start the server
//
async function startHttpServer()
{
	const app = express();
	app.use(express.json());
	
	const transports: { [sessionId: string]: InstanceType<typeof StreamableHTTPServerTransport> } = {};
	
	// Handle POST requests for client-to-server communication
	app.post('/mcp', async (req: Request, res: Response) => {
		const sessionId = req.headers['mcp-session-id'] as string | undefined;
		let transport: StreamableHTTPServerTransport;
		
		if (sessionId && transports[sessionId]) {
			transport = transports[sessionId];
		} else if (!sessionId && isInitializeRequest(req.body)) {
			transport = new StreamableHTTPServerTransport({
				sessionIdGenerator: () => randomUUID(),
				onsessioninitialized: (sessionId) => {
					transports[sessionId] = transport;
				}
			});
			
			transport.onclose = () => {
				if (transport.sessionId) {
					delete transports[transport.sessionId];
				}
			};
			
			// Create a new server instance for this session
			const httpServer = await createServerInstance();
			await httpServer.connect(transport);
		} else {
			res.status(400).json({
				jsonrpc: '2.0',
				error: { code: -32000, message: 'Bad Request: No valid session ID provided' },
				id: null,
			});
			return;
		}
		
		await transport.handleRequest(req, res, req.body);
	});

	// Reusable handle GET / DELETE requests
	const handleSessionRequest = async (req: express.Request, res: express.Response) => {
		const sessionId = req.headers['mcp-session-id'] as string | undefined;
		if (!sessionId || !transports[sessionId]) {
			res.status(400).send('Invalid or missing session ID');
			return;
		}
		const transport = transports[sessionId];
		await transport.handleRequest(req, res);
	};

	app.get('/mcp', handleSessionRequest);
	app.delete('/mcp', handleSessionRequest);

	const port = process.env.MCP_HTTP_PORT || 3000;
	app.listen(port, () => {
		console.log(`MCP Server listening on port ${port}`);
	});
}

async function createServerInstance()
{
	// Create a new server instance (you might want to extract server creation logic)
	const newServer = new McpServer({
		name: "mcp-openmsx",
		version: PACKAGE_VERSION,
	});

	// Re-register all tools (you might want to extract this to a separate function)
	try {
		await registerResources(newServer, resourcesDir);
		await registerTools(newServer, emuDirectories);
		await registerPrompts(newServer);
	} catch (error) {
		console.error("Error registering tools/resources:", error);
		throw error;
	}

	return newServer;
}


// ============================================================================
// Main function to start the MCP server
//
async function main()
{
	// Handle CLI arguments
	const args = process.argv.slice(2);
	if (args.includes('--help') || args.includes('-h')) {
		showHelp();
		return;
	}
	if (args.includes('--version') || args.includes('-v')) {
		console.log(PACKAGE_VERSION);
		return;
	}

	// Environment variables setup
	if (process.env.OPENMSX_EXECUTABLE) {
		emuDirectories.OPENMSX_EXECUTABLE = process.env.OPENMSX_EXECUTABLE;
	}
	if (process.env.OPENMSX_SCREENSHOT_DIR && process.env.OPENMSX_SCREENSHOT_DIR !== '') {
		emuDirectories.OPENMSX_SCREENSHOT_DIR = process.env.OPENMSX_SCREENSHOT_DIR;
	}
	if (process.env.OPENMSX_SCREENDUMP_DIR && process.env.OPENMSX_SCREENDUMP_DIR !== '') {
		emuDirectories.OPENMSX_SCREENDUMP_DIR = process.env.OPENMSX_SCREENDUMP_DIR;
	}
	if (process.env.OPENMSX_REPLAYS_DIR && process.env.OPENMSX_REPLAYS_DIR !== '') {
		emuDirectories.OPENMSX_REPLAYS_DIR = process.env.OPENMSX_REPLAYS_DIR;
	}
	if (process.env.OPENMSX_SHARE_DIR && process.env.OPENMSX_SHARE_DIR !== '') {
		emuDirectories.OPENMSX_SHARE_DIR = process.env.OPENMSX_SHARE_DIR;
	} else {
		// Auto-detect openMSX share directory if not set
		const detectedShareDir = detectOpenMSXShareDir();
		if (detectedShareDir) {
			emuDirectories.OPENMSX_SHARE_DIR = detectedShareDir;
			console.warn(`Auto-detected openMSX share folder: ${emuDirectories.OPENMSX_SHARE_DIR}`);
		} else {
			console.error("Error: OPENMSX_SHARE_DIR environment variable is not set and could not be auto-detected.");
		}
	}
	emuDirectories.MACHINES_DIR = path.join(emuDirectories.OPENMSX_SHARE_DIR, 'machines');
	emuDirectories.EXTENSIONS_DIR = path.join(emuDirectories.OPENMSX_SHARE_DIR, 'extensions');

	VectorDB.setIndexDirectory(vectorDbDir);

	// Detect transport type from environment or command line
	const transportType = process.env.MCP_TRANSPORT || process.argv[2] || 'stdio';
	
	if (transportType === 'http') {
		// Start Streamable HTTP server
		await startHttpServer();
	} else {
		// Default to stdio
		const transport = new StdioServerTransport();
		(await createServerInstance()).connect(transport);
	}
}

main().catch((error) => {
	gracefulShutdown(1);
	process.exit(1);
});
