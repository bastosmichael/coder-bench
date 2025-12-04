export interface GenerateOptions {
  model: string;
  prompt: string;
}

export interface GenerateResult {
  response: string;
  latencyMs: number;
}

export async function generate(options: GenerateOptions): Promise<GenerateResult> {
  const start = Date.now();
  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: options.model,
      prompt: options.prompt,
      stream: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama generate failed with status ${res.status}`);
  }

  const data = (await res.json()) as { response?: string };
  const latencyMs = Date.now() - start;

  return { response: data.response ?? '', latencyMs };
}
