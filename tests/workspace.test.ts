
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createWorkspace, runCommand } from '../src/runner/workspace.js';
import fs from 'fs/promises';
import { execa } from 'execa';
import path from 'path';

vi.mock('fs/promises');
vi.mock('execa');

describe('workspace', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('createWorkspace', () => {
        it('creates a workspace directory', async () => {
            const mockMkdir = vi.mocked(fs.mkdir);
            mockMkdir.mockResolvedValue(undefined);

            const workspacePath = await createWorkspace('model1', 'test-scenario');

            expect(workspacePath).toContain('.workdir/model1-test-scenario-');
            expect(mockMkdir).toHaveBeenCalledWith(expect.stringMatching(/\.workdir\/model1-test-scenario-\d+/), { recursive: true });
        });
    });

    describe('runCommand', () => {
        it('runs a command successfully', async () => {
            vi.mocked(execa).mockResolvedValue({
                stdout: 'OK',
                stderr: '',
                exitCode: 0
            } as any);

            const result = await runCommand('ls -la', '/cwd');

            expect(result.ok).toBe(true);
            expect(result.stdout).toBe('OK');
            expect(result.stderr).toBe('');
            expect(result.exitCode).toBe(0);

            expect(execa).toHaveBeenCalledWith('ls -la', {
                shell: true,
                cwd: '/cwd'
            });
        });

        it('handles command failure', async () => {
            vi.mocked(execa).mockRejectedValue({
                stdout: '',
                stderr: 'Error',
                exitCode: 1
            } as any);

            const result = await runCommand('fail', '/cwd');
            expect(result.ok).toBe(false);
            expect(result.exitCode).toBe(1);
        });

        it('handles execa throwing error', async () => {
            vi.mocked(execa).mockRejectedValue({
                message: 'Command failed',
                stderr: 'Fatal error',
                exitCode: 1,
                stdout: ''
            });

            const result = await runCommand('fail', '/cwd');
            expect(result.ok).toBe(false);
            expect(result.stderr).toBe('Fatal error');
            expect(result.exitCode).toBe(1);
        });

        it('handles execa throwing error without stderr', async () => {
            // Generic error doesn't have stderr property
            vi.mocked(execa).mockRejectedValue(new Error('Spawn failed'));

            const result = await runCommand('fail', '/cwd');
            expect(result.ok).toBe(false);
            expect(result.stderr).toBe('');
            // exitCode null because Error doesn't have it
            expect(result.exitCode).toBeNull();
        });
    });
});

