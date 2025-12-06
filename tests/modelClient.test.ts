
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generate } from '../src/runner/modelClient.js';

describe('modelClient', () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    it('generates response from ollama', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({
                response: 'Generated Code',
                // total_duration ignored
            })
        };
        fetchSpy.mockResolvedValue(mockResponse as any);

        const result = await generate({ model: 'test-model', prompt: 'hello' });

        expect(result.response).toBe('Generated Code');
        expect(result.latencyMs).toBeGreaterThanOrEqual(0);
        expect(fetchSpy).toHaveBeenCalledWith('http://localhost:11434/api/generate', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
                model: 'test-model',
                prompt: 'hello',
                stream: false,
            })
        }));
    });

    it('handles empty response from ollama', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({}) // No response field
        };
        fetchSpy.mockResolvedValue(mockResponse as any);

        const result = await generate({ model: 'm', prompt: 'p' });
        expect(result.response).toBe('');
    });

    it('throws error if fetch fails after retries', async () => {
        vi.useFakeTimers();
        fetchSpy.mockRejectedValue(new Error('Network error'));

        const promise = generate({ model: 'm', prompt: 'p' });

        // Advance time to bypass retries
        await vi.runAllTimersAsync();

        await expect(promise).rejects.toThrow('Network error');
        expect(fetchSpy).toHaveBeenCalledTimes(3);
    });

    it('throws error if response not ok', async () => {
        vi.useFakeTimers();
        fetchSpy.mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({})
        } as any);

        const promise = generate({ model: 'm', prompt: 'p' });
        await vi.runAllTimersAsync();

        await expect(promise).rejects.toThrow('Ollama generate failed with status 400');
    });
});

