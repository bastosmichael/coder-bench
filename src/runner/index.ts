import fs from 'fs/promises';
import { loadScenarios } from './scenarioLoader.js';
import { RunOptions, RunResult } from './types.js';

export async function runAll(options: RunOptions): Promise<void> {
  const rawModels = await fs.readFile(options.modelsFile, 'utf8');
  const modelList = JSON.parse(rawModels) as unknown;

  if (!Array.isArray(modelList) || modelList.some((item) => typeof item !== 'string')) {
    throw new Error(`Expected ${options.modelsFile} to contain an array of model names.`);
  }

  const modelPattern = options.filterModel ? new RegExp(options.filterModel) : null;
  const scenarioPattern = options.filterScenario ? new RegExp(options.filterScenario) : null;

  const models = modelPattern ? modelList.filter((name) => modelPattern.test(name)) : modelList;
  const scenarios = await loadScenarios(options.scenariosDir);
  const filteredScenarios = scenarioPattern
    ? scenarios.filter((scenario) => scenarioPattern.test(scenario.config.id))
    : scenarios;

  const results: RunResult[] = [];
  for (const model of models) {
    for (const scenario of filteredScenarios) {
      results.push({
        model,
        scenarioId: scenario.config.id,
        compileOk: false,
        lintErrors: 0,
        lintWarnings: 0,
        testsPassed: 0,
        testsFailed: 0,
        instructionViolations: [],
        latencyMs: 0,
      });
    }
  }

  await fs.writeFile(options.outFile, JSON.stringify(results, null, 2));
  console.log(`Wrote ${results.length} placeholder results to ${options.outFile}`);
}
