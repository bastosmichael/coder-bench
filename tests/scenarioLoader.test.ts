
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadScenarios } from '../src/runner/scenarioLoader.js';
import fs from 'fs/promises';
import path from 'path';

vi.mock('fs/promises');

describe('loadScenarios', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('loads scenarios correctly from nested directories', async () => {
        // Mock directory structure:
        // scenarios/
        //   lang1/
        //     scen1/
        //       scen1.json
        //     scen2/ (no json)
        //   not-a-dir

        const mockReaddir = vi.mocked(fs.readdir);
        const mockReadFile = vi.mocked(fs.readFile);
        const mockStat = vi.mocked(fs.stat);

        // Helper to create Dirent mock
        const createDirent = (name: string, isDir: boolean, isFile: boolean = !isDir) => ({
            name,
            isDirectory: () => isDir,
            isFile: () => isFile,
        } as any);

        // Root level: scenarios/ -> has [lang1 (dir), file.txt (file)]
        mockReaddir.mockResolvedValueOnce([
            createDirent('lang1', true),
            createDirent('file.txt', false)
        ] as any);

        // Lang level: scenarios/lang1/ -> has [scen1 (dir), scen2 (dir)]
        mockReaddir.mockResolvedValueOnce([
            createDirent('scen1', true),
            createDirent('scen2', true)
        ] as any);

        // Scen1 level: scenarios/lang1/scen1/ -> has [scen1.json (file)]
        mockReaddir.mockResolvedValueOnce([
            createDirent('scen1.json', false)
        ] as any);

        // Scen2 level: scenarios/lang1/scen2/ -> has [readme.md (file)]
        mockReaddir.mockResolvedValueOnce([
            createDirent('readme.md', false)
        ] as any);

        // Read JSON
        mockReadFile.mockImplementation(async (p: any) => {
            if (typeof p === 'string' && p.endsWith('scen1.json')) {
                return JSON.stringify({
                    id: 'scen1',
                    promptFile: 'prompt.md'
                });
            }
            if (typeof p === 'string' && p.endsWith('prompt.md')) {
                return 'Test Prompt';
            }
            throw new Error('Not found ' + p);
        });

        const scenarios = await loadScenarios('scenarios');

        expect(scenarios).toHaveLength(1);
        expect(scenarios[0].config.id).toBe('scen1');
        expect(scenarios[0].promptText).toBe('Test Prompt');
    });

    it('handles invalid json gracefully', async () => {
        const mockReaddir = vi.mocked(fs.readdir);
        const mockReadFile = vi.mocked(fs.readFile);

        const createDirent = (name: string, isDir: boolean, isFile: boolean = !isDir) => ({
            name,
            isDirectory: () => isDir,
            isFile: () => isFile,
        } as any);

        mockReaddir.mockResolvedValueOnce([
            createDirent('lang1', true)
        ] as any);
        mockReaddir.mockResolvedValueOnce([
            createDirent('scen1', true)
        ] as any);
        mockReaddir.mockResolvedValueOnce([
            createDirent('scen1.json', false)
        ] as any);

        // Read JSON - Fail
        mockReadFile.mockImplementation(async (p: any) => {
            if (typeof p === 'string' && p.endsWith('scen1.json')) return '{ invalid json ';
            return '';
        });

        const scenarios = await loadScenarios('scenarios');
        expect(scenarios).toHaveLength(0);
    });

    it('handles prompt loading failure', async () => {
        const mockReaddir = vi.mocked(fs.readdir);
        const mockReadFile = vi.mocked(fs.readFile);

        // Setup same as "loads scenarios correctly"
        const createDirent = (name: string, isDir: boolean, isFile: boolean = !isDir) => ({
            name, isDirectory: () => isDir, isFile: () => isFile,
        } as any);

        mockReaddir.mockResolvedValueOnce([createDirent('lang1', true)] as any);
        mockReaddir.mockResolvedValueOnce([createDirent('scen1', true)] as any);
        mockReaddir.mockResolvedValueOnce([createDirent('scen1.json', false)] as any);

        mockReadFile.mockImplementation(async (p: any) => {
            if (typeof p === 'string' && p.endsWith('scen1.json')) {
                return JSON.stringify({ id: 'scen1', promptFile: 'prompt.md' });
            }
            // Fail prompt read
            throw new Error('Prompt read failed');
        });

        // Spy on console.warn
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        const scenarios = await loadScenarios('scenarios');

        expect(scenarios).toHaveLength(1);
        expect(scenarios[0].promptText).toBe('');
        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Could not load prompt'));
    });
});
