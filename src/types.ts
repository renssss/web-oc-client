import type { SessionPromptData } from "@opencode-ai/sdk/client";

export * from "@opencode-ai/sdk/client";

export type SessionChatParams = NonNullable<SessionPromptData["body"]>;
