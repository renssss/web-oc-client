import type {
  FileListData,
  FileListResponse,
  FileReadData,
  FileReadResponse,
  FileStatusData,
  FileStatusResponse,
  FindFilesData,
  FindFilesResponse,
  FindSymbolsData,
  FindSymbolsResponse,
  FindTextData,
  FindTextResponse,
  InstanceDisposeData,
  InstanceDisposeResponse,
  OpencodeClient,
  PathGetData,
  PathGetResponse,
  ProjectCurrentData,
  ProjectCurrentResponse,
  ProjectListData,
  ProjectListResponse,
  VcsGetData,
  VcsGetResponse,
} from "@opencode-ai/sdk/client";
import { unwrap } from "../response.ts";

export interface ProjectFacade {
  list(options?: ProjectListData["query"]): Promise<ProjectListResponse>;
  current(options?: ProjectCurrentData["query"]): Promise<ProjectCurrentResponse>;
}

export interface PathFacade {
  get(options?: PathGetData["query"]): Promise<PathGetResponse>;
}

export interface VcsFacade {
  get(options?: VcsGetData["query"]): Promise<VcsGetResponse>;
}

export interface InstanceFacade {
  dispose(options?: InstanceDisposeData["query"]): Promise<InstanceDisposeResponse>;
}

export interface FileFacade {
  list(path: string, options?: Omit<FileListData["query"], "path">): Promise<FileListResponse>;
  read(path: string, options?: Omit<FileReadData["query"], "path">): Promise<FileReadResponse>;
  status(options?: FileStatusData["query"]): Promise<FileStatusResponse>;
}

export interface FindFacade {
  text(pattern: string, options?: Omit<FindTextData["query"], "pattern">): Promise<FindTextResponse>;
  files(query: string, options?: Omit<FindFilesData["query"], "query">): Promise<FindFilesResponse>;
  symbols(query: string, options?: Omit<FindSymbolsData["query"], "query">): Promise<FindSymbolsResponse>;
}

export function createProjectFacade(sdk: OpencodeClient): ProjectFacade {
  return {
    list: (options) => unwrap<ProjectListResponse>(sdk.project.list({ query: options })),
    current: (options) => unwrap<ProjectCurrentResponse>(sdk.project.current({ query: options })),
  };
}

export function createPathFacade(sdk: OpencodeClient): PathFacade {
  return {
    get: (options) => unwrap<PathGetResponse>(sdk.path.get({ query: options })),
  };
}

export function createVcsFacade(sdk: OpencodeClient): VcsFacade {
  return {
    get: (options) => unwrap<VcsGetResponse>(sdk.vcs.get({ query: options })),
  };
}

export function createInstanceFacade(sdk: OpencodeClient): InstanceFacade {
  return {
    dispose: (options) => unwrap<InstanceDisposeResponse>(sdk.instance.dispose({ query: options })),
  };
}

export function createFileFacade(sdk: OpencodeClient): FileFacade {
  return {
    list: (path, options) => unwrap<FileListResponse>(sdk.file.list({ query: { path, ...options } })),
    read: (path, options) => unwrap<FileReadResponse>(sdk.file.read({ query: { path, ...options } })),
    status: (options) => unwrap<FileStatusResponse>(sdk.file.status({ query: options })),
  };
}

export function createFindFacade(sdk: OpencodeClient): FindFacade {
  return {
    text: (pattern, options) => unwrap<FindTextResponse>(sdk.find.text({ query: { pattern, ...options } })),
    files: (query, options) => unwrap<FindFilesResponse>(sdk.find.files({ query: { query, ...options } })),
    symbols: (query, options) => unwrap<FindSymbolsResponse>(sdk.find.symbols({ query: { query, ...options } })),
  };
}
