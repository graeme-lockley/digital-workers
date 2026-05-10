/**
 * Simple AI Assistant
 *
 * A terminal-based AI assistant built with pi-mono libraries.
 * Features:
 *   - Full interactive TUI via pi-mono's InteractiveMode
 *   - Web browsing via the pi-web-fetch extension (web_fetch tool)
 *   - Session persistence across restarts (-c to continue last session)
 *   - All standard pi commands (/model, /settings, /new, /resume, etc.)
 */

import {
	type CreateAgentSessionRuntimeFactory,
	createAgentSessionFromServices,
	createAgentSessionRuntime,
	createAgentSessionServices,
	getAgentDir,
	InteractiveMode,
	SessionManager,
} from "@earendil-works/pi-coding-agent";
import webFetchExtension from "pi-web-fetch";

const cwd = process.cwd();
const agentDir = getAgentDir();

// --- Session management from CLI flags ---

const args = process.argv.slice(2);
const continueSession = args.includes("-c") || args.includes("--continue");
const resumeSession = args.includes("-r") || args.includes("--resume");
const noSession = args.includes("--no-session");

function buildSessionManager(): SessionManager {
	if (noSession) return SessionManager.inMemory(cwd);
	if (continueSession) return SessionManager.continueRecent(cwd);
	return SessionManager.create(cwd);
}

// --- Runtime factory ---
// Called once on startup and again whenever the user switches sessions
// (/new, /resume, /fork). We inject the web-fetch extension factory here
// so it is present in every session, including newly created ones.

const createRuntime: CreateAgentSessionRuntimeFactory = async ({ cwd, agentDir, sessionManager, sessionStartEvent }) => {
	const services = await createAgentSessionServices({
		cwd,
		agentDir,
		resourceLoaderOptions: {
			// Inject web-fetch as an inline extension factory so it is
			// available to the LLM alongside the standard coding tools.
			extensionFactories: [webFetchExtension],

			// Append a note about the web_fetch capability to the default
			// system prompt rather than replacing it entirely.
			appendSystemPrompt: [
				"You are a helpful AI assistant running in a terminal. " +
					"You have access to a `web_fetch` tool that lets you retrieve and read web pages. " +
					"Use it whenever you need up-to-date information, documentation, or any content from the internet. " +
					"You can also use `read`, `bash`, `edit`, and `write` to interact with the local filesystem. " +
					"Be concise, accurate, and friendly.",
			],
		},
	});

	return {
		...(await createAgentSessionFromServices({
			services,
			sessionManager,
			sessionStartEvent,
		})),
		services,
		diagnostics: services.diagnostics,
	};
};

// --- Bootstrap ---

const sessionManager = buildSessionManager();

const runtime = await createAgentSessionRuntime(createRuntime, {
	cwd,
	agentDir,
	sessionManager,
});

// --- Launch the pi-mono interactive TUI ---

const mode = new InteractiveMode(runtime, {
	migratedProviders: [],
	modelFallbackMessage: runtime.modelFallbackMessage,
	verbose: args.includes("--verbose"),
});

await mode.run();
