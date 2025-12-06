import { describe, expect, it, vi } from 'vitest';
import { LRUCache } from '../src/lruCache';

describe('LRUCache Advanced', () => {
  it('respects capacity and calls onDispose', () => {
    const onDispose = vi.fn();
    const cache = new LRUCache<string, number>({ capacity: 2, onDispose });

    cache.set('a', 1);
    cache.set('b', 2);
    // order: b, a

    // access a, making it most recent
    expect(cache.get('a')).toBe(1);
    // order: a, b

    // insert c, evict b (least recent)
    cache.set('c', 3);

    expect(cache.has('b')).toBe(false);
    expect(cache.get('b')).toBeUndefined();
    expect(onDispose).toHaveBeenCalledWith('b', 2);
    expect(cache.size()).toBe(2);
  });

  it('supports iteration in MRU (Most Recently Used) order or Insert Order depending on impl', () => {
    // NOTE: Prompt asked for "recency" order typically means most recent first OR least recent first. 
    // Usually Map/LRU iterators go from Oldest -> Newest (insertion/access order).
    // Let's assume standard Map behavior: Oldest (LRU) first yielded.
    // If the prompt said "most recently used first", we check that.
    // Prompt said: "Iteration must happen in order of recency (most recently used first)."

    const cache = new LRUCache<string, number>({ capacity: 3 });
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);

    // order (access/insert): a, b, c (c is most recent)

    cache.get('a');
    // order: b, c, a (a is most recent)

    const items = [...cache];
    // Expect MRU first: a, c, b
    expect(items).toEqual([['a', 1], ['c', 3], ['b', 2]]);
  });

  it('handles TTL correctly', async () => {
    const cache = new LRUCache<string, number>({ capacity: 5, ttlMs: 50 });
    cache.set('x', 10);
    expect(cache.get('x')).toBe(10);

    await new Promise(r => setTimeout(r, 60));

    // Should be expired
    expect(cache.get('x')).toBeUndefined();
    expect(cache.has('x')).toBe(false);
    expect(cache.size()).toBe(0);
  });

  it('delete triggers dispose', () => {
    const onDispose = vi.fn();
    const cache = new LRUCache<string, number>({ capacity: 5, onDispose });
    cache.set('x', 1);
    cache.delete('x');

    expect(onDispose).toHaveBeenCalledWith('x', 1);
    expect(cache.size()).toBe(0);
  });

  it('clear resets everything', () => {
    const cache = new LRUCache<string, number>({ capacity: 5 });
    cache.set('x', 1);
    cache.set('y', 2);
    cache.clear();
    expect(cache.size()).toBe(0);
    expect([...cache].length).toBe(0);
  });
});
