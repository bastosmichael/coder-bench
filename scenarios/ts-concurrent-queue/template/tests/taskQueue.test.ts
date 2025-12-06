
import { describe, expect, it, vi } from 'vitest';
import { TaskQueue } from '../src/taskQueue';

describe('TaskQueue', () => {
    it('respects concurrency limits', async () => {
        const queue = new TaskQueue<number>({ concurrency: 2 });
        let running = 0;
        let maxRunning = 0;

        const task = async () => {
            running++;
            maxRunning = Math.max(maxRunning, running);
            await new Promise(r => setTimeout(r, 20));
            running--;
            return 1;
        };

        const promises = [
            queue.add(task),
            queue.add(task),
            queue.add(task),
            queue.add(task),
            queue.add(task)
        ];

        await Promise.all(promises);
        expect(maxRunning).toBeLessThanOrEqual(2);
        expect(maxRunning).toBe(2); // Should have reached 2
    });

    it('handles retries on failure', async () => {
        const queue = new TaskQueue<string>({ concurrency: 1, maxRetries: 3 });
        let attempts = 0;

        const task = vi.fn().mockImplementation(async () => {
            attempts++;
            if (attempts <= 2) {
                throw new Error('fail');
            }
            return 'success';
        });

        const result = await queue.add(task);
        expect(result).toBe('success');
        expect(attempts).toBe(3); // Initial + 2 failures
    });

    it('reports correct status', async () => {
        const queue = new TaskQueue<void>({ concurrency: 1 });

        // Start a slow task
        const p1 = queue.add(() => new Promise(r => setTimeout(r, 50)));
        // Queue another
        const p2 = queue.add(() => Promise.resolve());

        const status = queue.status();
        // 1 running, 1 pending
        expect(status.running).toBe(1);
        expect(status.pending).toBe(1);

        await Promise.all([p1, p2]);

        const finalStatus = queue.status();
        expect(finalStatus.completed).toBe(2);
        expect(finalStatus.running).toBe(0);
        expect(finalStatus.pending).toBe(0);
    });

    it('respects rate limits (approximate)', async () => {
        // 5 tokens per 100ms
        const queue = new TaskQueue<number>({
            concurrency: 10,
            rateLimit: { tokens: 2, intervalMs: 100 }
        });

        const start = Date.now();
        const tasks = [];
        for (let i = 0; i < 5; i++) {
            tasks.push(queue.add(async () => 1));
        }

        await Promise.all(tasks);
        const duration = Date.now() - start;

        // Should take at least ~200ms to process 5 items with 2 per 100ms
        // 0ms: 2 run
        // 100ms: 2 run
        // 200ms: 1 run
        expect(duration).toBeGreaterThan(150);
    });
});
