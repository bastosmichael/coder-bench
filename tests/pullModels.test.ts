
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pullModelsCommand } from '../src/runner/pullModels.js';
import fs from 'fs/promises';
import { execa } from 'execa';

vi.mock('fs/promises');
vi.mock('execa');

describe('pullModelsCommand', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('waits between pulls if delay specified', async () => {
        const models = ['m1', 'm2'];
        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(models));
        vi.mocked(execa).mockResolvedValue({} as any);

        const start = Date.now();
        await pullModelsCommand({ modelsFile: 'models.json', delayMs: 10 });
        const duration = Date.now() - start;

        expect(duration).toBeGreaterThanOrEqual(10);
    });

    it('pulls models successfully', async () => {
        const models = ['model1', 'model2'];
        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(models));
        vi.mocked(execa).mockResolvedValue({} as any);

        await pullModelsCommand({ modelsFile: 'models.json', delayMs: 0 });

        expect(fs.readFile).toHaveBeenCalledWith('models.json', 'utf8');
        expect(execa).toHaveBeenCalledTimes(2);
        expect(execa).toHaveBeenCalledWith('ollama', ['pull', 'model1'], { stdio: 'inherit' });
        expect(execa).toHaveBeenCalledWith('ollama', ['pull', 'model2'], { stdio: 'inherit' });
    });

    it('throws if models file is invalid array', async () => {
        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({ not: 'array' }));

        await expect(pullModelsCommand({ modelsFile: 'models.json', delayMs: 0 }))
            .rejects.toThrow('Expected models.json to contain an array of model names.');
    });

    it('handles execution errors', async () => {
        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(['bad-model']));
        vi.mocked(execa).mockRejectedValue(new Error('Pull failed'));

        // It catches errors inside the loop
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        await expect(pullModelsCommand({ modelsFile: 'models.json', delayMs: 0 })).resolves.not.toThrow();

        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to pull bad-model'));
    });
});
