import fs from 'fs/promises';
import path from 'path';
import { ScenarioConfig } from './types.js';

export interface LoadedScenario {
  config: ScenarioConfig;
  promptText: string;
}

export async function loadScenarios(dir: string): Promise<LoadedScenario[]> {
  const scenarios: LoadedScenario[] = [];

  async function scan(currentDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await scan(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        // Only load if it looks like a scenario config (has 'id' and 'promptFile')
        try {
          const rawConfig = await fs.readFile(fullPath, 'utf8');
          const config: ScenarioConfig = JSON.parse(rawConfig);

          if (config.id && config.promptFile) {
            // promptFile is relative to the config file's directory usually, 
            // but typically defined relative to project root in current config.
            // Let's resolve consistent with current usage.
            // Current usage: "promptFile": "scenarios/ts-lru-cache/prompt.md"
            // If we move files, we might need to adjust the paths in JSON or resolve relative to the JSON file.
            // The current code did: path.resolve(dir, config.promptFile); where dir was 'scenarios' root.
            // So promptFile was likely relative to 'scenarios' folder?
            // Let's check a config file content from previous steps.
            // "promptFile": "scenarios/ts-concurrent-queue/prompt.md"
            // Ah, it's relative to project root if it starts with scenarios? 
            // Wait, path.resolve(dir, config.promptFile) -> if dir is absolute path to scenarios, and promptFile is scenarios/..., that would duplicate.
            // Let's check how 'dir' is passed in 'index.ts'.

            // If config.promptFile is "scenarios/...", and we are in "scenarios/typescript/...", 
            // we might need to fix the paths in the JSON files or handle it here.
            // For now, let's assume paths in JSON are relative to the CWD (project root).
            // The original code: path.resolve(dir, config.promptFile).
            // If dir is /abs/.../scenarios, and promptFile is scenarios/foo.md, path.resolve treats second arg as relative.
            // So /abs/.../scenarios/scenarios/foo.md. That seems wrong if promptFile includes 'scenarios'.
            // Let's assume loading logic was working, implies promptFile might NOT include 'scenarios' prefix or dir is project root?
            // Checking previous write_to_file: "promptFile": "scenarios/ts-concurrent-queue/prompt.md"
            // If loadScenarios(dir) is called with dir=/.../coder-benchmark/scenarios
            // path.resolve(dir, "scenarios/...") -> /.../scenarios/scenarios/...
            // This suggests I should check index.ts to see what it passes as 'dir'.

            const promptPath = path.resolve(process.cwd(), config.promptFile);
            let promptText = '';
            try {
              promptText = await fs.readFile(promptPath, 'utf8');
            } catch (e) {
              console.warn(`Could not load prompt for ${config.id}: ${e}`);
            }
            scenarios.push({ config, promptText });
          }
        } catch (err) {
          // ignore non-json or bad json
        }
      }
    }
  }

  await scan(dir);
  return scenarios;
}
