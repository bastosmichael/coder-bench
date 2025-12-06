import fs from 'fs/promises';
import { RunResult } from './types.js';
import { summarizeModelResults } from './metrics.js';

export async function summarizeResults(file: string): Promise<void> {
  try {
    const content = await fs.readFile(file, 'utf8');
    const results = JSON.parse(content) as RunResult[];

    const summaries = summarizeModelResults(results);

    // Format for display
    const tableData = summaries.map(s => ({
      Model: s.model,
      'Compile %': s.compileRate.toFixed(1),
      'Lint Clean %': s.lintCleanRate.toFixed(1),
      'Test Pass %': s.testPassRate.toFixed(1),
      'Score': s.accuracyScore.toFixed(1),
      'Latency (ms)': s.medianLatencyMs
    }));

    console.table(tableData);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`Could not read results from ${file}: ${message}`);
  }
}
