import { createOpencodeWebClient, type OpenCodeWebClient } from "web-oc-client";

export const DEFAULT_BASE_URL = "http://localhost:54321";

const configured = (import.meta.env.VITE_OPENCODE_BASE_URL as string | undefined)?.trim();

export const baseUrl = configured && configured.length > 0 ? configured : DEFAULT_BASE_URL;

export const client: OpenCodeWebClient = createOpencodeWebClient({ baseUrl });
