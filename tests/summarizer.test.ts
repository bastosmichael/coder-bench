
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { summarizeResults } from '../src/runner/summarizer.js';
import fs from 'fs/promises';

vi.mock('fs/promises');

describe('summarizeResults', () => {
    const consoleTableSpy = vi.spyOn(console, 'table').mockImplementation(() => { });
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('reads results and updates readme', async () => {
        const mockResults = [
            {
                model: 'model1',
                scenarioId: 'ts-test',
                compileOk: true,
                lintErrors: 0,
                lintWarnings: 0,
                testsPassed: 1,
                testsFailed: 0,
                instructionViolations: [],
                latencyMs: 100
            }
        ];

        const mockReadme = '# Benchmark\n\nExisting text\n\n## Benchmark Summary\n\nOld table';

        const mockReadFile = vi.mocked(fs.readFile);
        const mockWriteFile = vi.mocked(fs.writeFile);

        mockReadFile.mockImplementation(async (path: any) => {
            if (path === 'results.json') return JSON.stringify(mockResults);
            if (path === 'README.md') return mockReadme;
            throw new Error('Not found');
        });

        await summarizeResults('results.json');

        // Check if console.table was called
        expect(consoleTableSpy).toHaveBeenCalled();

        // Check if README was updated
        expect(mockWriteFile).toHaveBeenCalledWith('README.md', expect.stringContaining('Last updated:'));
        expect(mockWriteFile).toHaveBeenCalledWith('README.md', expect.stringContaining('| model1 |'));
        expect(mockWriteFile).toHaveBeenCalledWith('README.md', expect.stringContaining('| 110.0 |')); // Score check
    });

    it('creates summary section if missing in readme', async () => {
        const mockResults = [{ model: 'm', scenarioId: 'ts-1', compileOk: true, lintErrors: 0, lintWarnings: 0, testsPassed: 0, testsFailed: 0, instructionViolations: [], latencyMs: 0 }];
        const mockReadme = '# Benchmark\n\nNo summary here.';

        const mockReadFile = vi.mocked(fs.readFile);
        const mockWriteFile = vi.mocked(fs.writeFile);

        mockReadFile.mockImplementation((path: any) => Promise.resolve(path === 'results.json' ? JSON.stringify(mockResults) : mockReadme) as any);

        await summarizeResults('results.json');

        expect(mockWriteFile).toHaveBeenCalledWith('README.md', expect.stringContaining('## Benchmark Summary'));
    });

    it('handles file read errors gracefully', async () => {
        const mockReadFile = vi.mocked(fs.readFile);
        mockReadFile.mockRejectedValue(new Error('File not found'));

        await summarizeResults('results.json');

        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Could not read results'));
    });
});
