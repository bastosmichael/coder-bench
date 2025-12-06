You are a senior TypeScript engineer.

I have provided a broken implementation in `src/lruCache.ts` that fails compilation, has no types, and contains bugs.
Your task is to REWRITE and FIX it to meet the following API and requirements:

```ts
export class LRUCache<K, V> {
  constructor(options: { capacity: number; ttlMs?: number });
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  has(key: K): boolean;
  clear(): void;
  size(): number;
}
```

Requirements:
- Fix all syntax errors.
- Fully type the code (Generics <K, V>).
- Remove `@ts-nocheck`.
- Do not use `any`.
- `get` and `set` must be O(1). usage of array.shift/push is O(N) - fix this using a Map or Doubly Linked List.
- If `ttlMs` is provided, implement lazy expiration.


Output rules (important for our extraction logic):
- Respond with a single fenced code block using language `ts`.
- The code block must contain **only** the full contents of `src/lruCache.ts` and nothing else outside the fence.
