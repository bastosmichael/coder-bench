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

    // Generate Markdown Table
    let markdown = '\n| Model | Compile % | Lint Clean % | Test Pass % | Score | Latency (ms) |\n';
    markdown += '|---|---|---|---|---|---|\n';

    for (const s of summaries) {
      markdown += `| ${s.model} | ${s.compileRate.toFixed(1)} | ${s.lintCleanRate.toFixed(1)} | ${s.testPassRate.toFixed(1)} | ${s.accuracyScore.toFixed(1)} | ${s.medianLatencyMs} |\n`;
    }

    // Read README
    const readmePath = 'README.md';
    let readme = await fs.readFile(readmePath, 'utf8');

    const header = '## Benchmark Summary';
    const regex = new RegExp(`${header}[\\s\\S]*$`, 'i');

    if (regex.test(readme)) {
      readme = readme.replace(regex, `${header}\n\nLast updated: ${new Date().toISOString()}\n${markdown}`);
    } else {
      readme += `\n\n${header}\n\nLast updated: ${new Date().toISOString()}\n${markdown}`;
    }

    await fs.writeFile(readmePath, readme);
    console.log(`Updated ${readmePath} with new results.`);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`Could not read results from ${file}: ${message}`);
  }
}
