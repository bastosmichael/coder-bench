
You are a Principal Software Engineer.

I have provided a stub implementation in `src/taskQueue.ts`.
Your task is to implement a robust, generic `TaskQueue` that handles concurrency management, rate limiting, and retries.

```ts
export class TaskQueue<T> {
  constructor(options: { 
    concurrency: number; 
    rateLimit?: { tokens: number; intervalMs: number }; // Token bucket or simple window
    maxRetries?: number;
  });

  /**
   * Adds a task to the queue.
   * @param taskFn Async function to execute
   * @returns Promise that resolves with the task result
   */
  add(taskFn: () => Promise<T>): Promise<T>;

  /**
   * Returns current queue status
   */
  status(): { pending: number; running: number; completed: number; failed: number };
}
```

Requirements:
1. **Concurrency Control**: At most `options.concurrency` tasks should run simultaneously.
2. **Rate Limiting**: If `rateLimit` is provided, ensure tasks are started respecting the `tokens` per `intervalMs` limit.
3. **Retries**: If a task fails (throws), it should be retried up to `maxRetries` times with exponential backoff.
4. **Ordering**: Tasks should generally run in First-In-First-Out (FIFO) order, respecting concurrency limits.
5. **No External Libraries**: Use only native Node.js/TypeScript features. No `async` library, no `rxjs`.

Correctness is critical. Deadlocks or race conditions are failures.
Output the full content of `src/taskQueue.ts` in a single markdown code block.
