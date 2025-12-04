#!/usr/bin/env node
import { program } from "commander";
import { runAll } from "../runner/index.js";
import { summarize } from "../runner/summarize.js";

program
  .command("run")
  .option("--models <file>", "Model list JSON", "models.json")
  .option("--scenarios <dir>", "Scenarios directory", "scenarios")
  .option("--out <file>", "Output results JSON", "results.json")
  .option("--concurrency <n>", "Concurrency level", "1")
  .action(runAll);

program
  .command("summarize <file>")
  .action(summarize);

program.parse();
