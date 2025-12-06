I have provided a broken, inefficient, and untyped implementation in `src/lruCache.ts`.
Your task is to REWRITE it from scratch to implement a **production-grade**, high-performance LRU Cache.

```ts
export class LRUCache<K, V> implements Iterable<[K, V]> {
  constructor(options: { 
    capacity: number; 
    ttlMs?: number; 
    onDispose?: (key: K, value: V) => void 
  });
  
  // O(1)
  get(key: K): V | undefined;
  
  // O(1)
  set(key: K, value: V): void;
  
  // O(1)
  has(key: K): boolean;
  
  // O(1)
  delete(key: K): boolean;
  
  // O(1)
  clear(): void;
  
  // O(1)
  size(): number;

  // Implementation of Iterable interface
  [Symbol.iterator](): Iterator<[K, V]>;
}
```

Requirements:
1. **Strict O(1) Performance**: 
   - `get`, `set`, `delete`, and `has` MUST be O(1). 
   - Iteration must happen in order of recency (most recently used first).
   - Usage of `Array.prototype` methods that iterate (indexOf, splice, shift) is FORBIDDEN. You MUST implement a Doubly Linked List manually or use JavaScript `Map`'s insertion order guarantees efficiently (but `Map` iterator is insertion order, for LRU reordering strict Linked List manipulation is often preferred for update performance).
   -(Tip: JS `Map` re-insertion is O(1) and updates order, so correct usage of `Map` is allowed IF you prove it handles LRU updates correctly).

2. **Advanced Features**:
   - **TTL (Time To Live)**: Entries must expire. Lazy expiration on `get` is acceptable.
   - **onDispose**: If an item is evicted (due to valid capacity) or deleted (manually), call `onDispose(key, value)`. Do NOT call `onDispose` if an item is merely updated/overwritten.

3. **Type Safety**:
   - Strict Generics `<K, V>`.
   - No `any`, no `@ts-ignore`.

4. **Correctness**:
   - Fix all bugs in the provided template.
   - Ensure `size()` is accurate.
   - Ensure `undefined` is returned for expired items.

Input Code (bad):
The provided code in `src/lruCache.ts` is terrible. Ignore its logic, but replace its file content entirely.
