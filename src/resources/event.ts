import type { Event, OpencodeClient } from "@opencode-ai/sdk/client";
import { EventStream, type StreamOptions } from "../events.ts";

export interface EventSubscribeOptions {
  directory?: string;
}

export interface EventFacade {
  subscribe(options?: EventSubscribeOptions, stream?: StreamOptions): Promise<EventStream<Event>>;
}

export function createEventFacade(sdk: OpencodeClient): EventFacade {
  return {
    async subscribe(options, stream) {
      const controller = new AbortController();
      const externalSignal = stream?.signal;
      if (externalSignal !== undefined) {
        externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
      }
      const eventStream = new EventStream<Event>(controller, stream?.onError);
      const result = await sdk.event.subscribe({
        query: options,
        signal: controller.signal,
        sseDefaultRetryDelay: stream?.sseDefaultRetryDelay,
        sseMaxRetryAttempts: stream?.sseMaxRetryAttempts,
        sseMaxRetryDelay: stream?.sseMaxRetryDelay,
        onSseError: (error) => eventStream.recordError(error),
      });
      eventStream.bind(result.stream[Symbol.asyncIterator]());
      return eventStream;
    },
  };
}
