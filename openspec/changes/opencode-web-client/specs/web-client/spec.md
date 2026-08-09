## Purpose

Defines a complete, framework-agnostic web client for the opencode server built on `@opencode-ai/sdk`, exposing every documented server endpoint through typed resource wrappers and live SSE event streaming.

## ADDED Requirements

### Requirement: Configurable server connection
The client SHALL connect to an opencode server at a configurable base URL. The base URL SHALL default to `http://localhost:54321` and SHALL be overridable via the `OPENCODE_BASE_URL` environment variable or an explicit option at client construction.

#### Scenario: Default connection
- **WHEN** a client is constructed without a base URL and `OPENCODE_BASE_URL` is unset
- **THEN** the client targets `http://localhost:54321`

#### Scenario: Explicit base URL wins
- **WHEN** a client is constructed with an explicit `baseURL` option and `OPENCODE_BASE_URL` is also set
- **THEN** the client uses the explicitly provided base URL

#### Scenario: Unreachable server surfaces an error
- **WHEN** a request is made and the server is unreachable
- **THEN** the client rejects with a clear connection error rather than silently failing

### Requirement: Typed resource wrappers
The client SHALL expose one typed wrapper per server resource: `project`, `pty`, `config`, `tool`, `instance`, `path`, `vcs`, `session`, `command`, `provider`, `find`, `file`, `app`, `mcp`, `lsp`, `formatter`, `tui`, `auth`, and `event`. Each wrapper SHALL expose methods matching the documented endpoints of its resource, with typed request inputs and typed response payloads.

#### Scenario: Wrapper surface matches the server API
- **WHEN** a consumer inspects a resource wrapper
- **THEN** it finds a method for each documented endpoint of that resource

#### Scenario: Typed responses
- **WHEN** a wrapper method resolves
- **THEN** the returned payload matches the server's documented response type for that endpoint

### Requirement: Project endpoints
The client SHALL support listing all projects and getting the current project.

#### Scenario: List projects
- **WHEN** the consumer calls the project list method
- **THEN** the client returns all projects known to the server

#### Scenario: Get current project
- **WHEN** the consumer calls the current project method
- **THEN** the client returns the server's current project

### Requirement: PTY endpoints
The client SHALL support listing, creating, removing, fetching, updating, and connecting to PTY sessions.

#### Scenario: Create a PTY session
- **WHEN** the consumer calls the PTY create method with a valid payload
- **THEN** the client creates a PTY session and returns its details

#### Scenario: Connect to a PTY session
- **WHEN** the consumer calls the PTY connect method for an existing session
- **THEN** the client returns a live connection to the PTY session

### Requirement: Config endpoints
The client SHALL support getting configuration info, updating configuration, and listing providers.

#### Scenario: Get config info
- **WHEN** the consumer calls the config get method
- **THEN** the client returns the server's configuration info

#### Scenario: List providers
- **WHEN** the consumer calls the config providers method
- **THEN** the client returns all configured providers

### Requirement: Tool endpoints
The client SHALL support listing all tool IDs (built-in and dynamically registered) and listing tools with JSON schema parameters for a provider/model.

#### Scenario: List tool IDs
- **WHEN** the consumer calls the tool ids method
- **THEN** the client returns all known tool IDs

#### Scenario: List tools for a provider/model
- **WHEN** the consumer calls the tool list method for a specific provider and model
- **THEN** the client returns tools with their JSON schema parameters

### Requirement: Instance endpoint
The client SHALL support disposing the current server instance.

#### Scenario: Dispose instance
- **WHEN** the consumer calls the instance dispose method
- **THEN** the server disposes the current instance

### Requirement: Path endpoint
The client SHALL support fetching the current working path of the server instance.

#### Scenario: Get current path
- **WHEN** the consumer calls the path get method
- **THEN** the client returns the server's current path

### Requirement: VCS endpoint
The client SHALL support fetching VCS information for the current server instance.

#### Scenario: Get VCS info
- **WHEN** the consumer calls the vcs get method
- **THEN** the client returns VCS info for the instance

### Requirement: Session management endpoints
The client SHALL support listing, creating, fetching, updating, and deleting sessions; plus session status, children, todo, init, fork, abort, share, unshare, diff, and summarize operations.

#### Scenario: List sessions
- **WHEN** the consumer calls the session list method
- **THEN** the client returns all sessions

#### Scenario: Create a session
- **WHEN** the consumer calls the session create method
- **THEN** the client returns the newly created session

#### Scenario: Fork a session
- **WHEN** the consumer calls the session fork method at a specific message
- **THEN** the client returns a forked session

#### Scenario: Abort a session
- **WHEN** the consumer calls the session abort method for an active session
- **THEN** the server stops the session and the client returns the abort result

#### Scenario: Share a session
- **WHEN** the consumer calls the session share method
- **THEN** the client returns a share URL for the session

#### Scenario: Summarize a session
- **WHEN** the consumer calls the session summarize method
- **THEN** the client returns a summary for the session

#### Scenario: Get session diff
- **WHEN** the consumer calls the session diff method
- **THEN** the client returns the diff for the session

### Requirement: Session messaging endpoints
The client SHALL support listing messages, sending prompts synchronously and asynchronously, fetching a single message, sending commands, running shell commands, and reverting/unreverting messages.

#### Scenario: List messages
- **WHEN** the consumer calls the session messages method
- **THEN** the client returns all messages for the session

#### Scenario: Send a prompt
- **WHEN** the consumer calls the session prompt method with a valid prompt payload
- **THEN** the server processes the message and the client returns the assistant response

#### Scenario: Send an async prompt
- **WHEN** the consumer calls the session promptAsync method
- **THEN** the server starts the session if needed and the client returns immediately

#### Scenario: Get a single message
- **WHEN** the consumer calls the session message method for a known message
- **THEN** the client returns that message

#### Scenario: Send a command
- **WHEN** the consumer calls the session command method
- **THEN** the server executes the command in the session

#### Scenario: Run a shell command
- **WHEN** the consumer calls the session shell method
- **THEN** the server runs the shell command and the client returns its result

#### Scenario: Revert and unrevert messages
- **WHEN** the consumer calls the session revert method and later the session unrevert method
- **THEN** the client first reverts the message, then restores all reverted messages

### Requirement: Command endpoint
The client SHALL support listing all commands known to the server.

#### Scenario: List commands
- **WHEN** the consumer calls the command list method
- **THEN** the client returns all commands

### Requirement: Provider and OAuth endpoints
The client SHALL support listing providers, getting provider authentication methods, and the provider OAuth authorize/callback flow.

#### Scenario: List providers
- **WHEN** the consumer calls the provider list method
- **THEN** the client returns all providers

#### Scenario: Authorize a provider
- **WHEN** the consumer calls the provider OAuth authorize method
- **THEN** the server starts OAuth for the provider and the client returns the authorization result

#### Scenario: Handle OAuth callback
- **WHEN** the consumer calls the provider OAuth callback method with a callback payload
- **THEN** the client completes the OAuth flow for the provider

### Requirement: Find endpoints
The client SHALL support text search, file search, and workspace symbol search.

#### Scenario: Find text in files
- **WHEN** the consumer calls the find text method with a query
- **THEN** the client returns matching text results

#### Scenario: Find files
- **WHEN** the consumer calls the find files method
- **THEN** the client returns matching files

#### Scenario: Find workspace symbols
- **WHEN** the consumer calls the find symbols method
- **THEN** the client returns matching symbols

### Requirement: File endpoints
The client SHALL support listing directories, reading files, and fetching file status.

#### Scenario: List a directory
- **WHEN** the consumer calls the file list method
- **THEN** the client returns the directory listing

#### Scenario: Read a file
- **WHEN** the consumer calls the file read method for an existing file
- **THEN** the client returns the file contents

#### Scenario: Get file status
- **WHEN** the consumer calls the file status method
- **THEN** the client returns file status information

### Requirement: App endpoints
The client SHALL support writing a log entry to server logs and listing all agents.

#### Scenario: Write a log entry
- **WHEN** the consumer calls the app log method with a log payload
- **THEN** the server appends the entry to its logs

#### Scenario: List agents
- **WHEN** the consumer calls the app agents method
- **THEN** the client returns all agents

### Requirement: MCP endpoints
The client SHALL support getting MCP server status, adding an MCP server dynamically, connecting and disconnecting MCP servers, and the MCP OAuth auth flow (remove, start, callback, authenticate, set).

#### Scenario: Get MCP status
- **WHEN** the consumer calls the mcp status method
- **THEN** the client returns MCP server status

#### Scenario: Add an MCP server
- **WHEN** the consumer calls the mcp add method with a server payload
- **THEN** the client dynamically adds the MCP server

#### Scenario: Connect and disconnect an MCP server
- **WHEN** the consumer calls the mcp connect method and later the mcp disconnect method for the same server
- **THEN** the client connects the server then disconnects it

#### Scenario: Start MCP OAuth flow
- **WHEN** the consumer calls the mcp auth start method for a server
- **THEN** the client starts the OAuth flow for that MCP server

### Requirement: LSP endpoint
The client SHALL support getting LSP server status.

#### Scenario: Get LSP status
- **WHEN** the consumer calls the lsp status method
- **THEN** the client returns LSP server status

### Requirement: Formatter endpoint
The client SHALL support getting formatter status.

#### Scenario: Get formatter status
- **WHEN** the consumer calls the formatter status method
- **THEN** the client returns formatter status

### Requirement: TUI endpoints
The client SHALL support the TUI control surface: next request and response, append/submit/clear prompt, open help/sessions/themes/models dialogs, execute commands, show toasts, and publish events.

#### Scenario: Get next TUI request
- **WHEN** the consumer calls the tui control next method
- **THEN** the client returns the next request from the TUI queue

#### Scenario: Submit a TUI response
- **WHEN** the consumer calls the tui control response method with a response payload
- **THEN** the client submits the response to the TUI queue

#### Scenario: Execute a TUI command
- **WHEN** the consumer calls the tui executeCommand method with a valid command
- **THEN** the server executes the TUI command

#### Scenario: Publish a TUI event
- **WHEN** the consumer calls the tui publish method
- **THEN** the client publishes the event to the TUI

### Requirement: Permission responses
The client SHALL support responding to permission requests for a session.

#### Scenario: Respond to a permission request
- **WHEN** the consumer calls the permission response method with a session ID, permission ID, and decision
- **THEN** the server applies the permission decision

### Requirement: Event streaming
The client SHALL subscribe to server events via server-sent events (SSE) and deliver them as an async stream. The stream SHALL support cancellation and SHALL surface stream errors to the consumer.

#### Scenario: Receive live events
- **WHEN** the consumer subscribes to the event stream and the server emits an event
- **THEN** the client delivers the event to the consumer

#### Scenario: Cancel the stream
- **WHEN** the consumer cancels an active event subscription
- **THEN** the client stops consuming the stream and releases the connection

#### Scenario: Stream errors surface
- **WHEN** the event stream fails or disconnects
- **THEN** the client surfaces the error to the consumer instead of hanging silently

### Requirement: Consistent error handling
All client methods SHALL reject with a typed error that preserves the server's error status and message when the server returns an error response.

#### Scenario: Server error propagates
- **WHEN** a method call receives a non-2xx response with an error body
- **THEN** the client rejects with an error carrying the server's status and message
