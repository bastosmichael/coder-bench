
You are a Principal Software Engineer.

I have provided a stub implementation in `src/lru_cache.dart`.
Your task is to implement a **production-grade**, high-performance LRU Cache in Dart.

```dart
class LRUCache<K, V> {
  /// [capacity] is the maximum number of items.
  /// [onDispose] is called when an item is evicted due to capacity.
  LRUCache(int capacity, {void Function(K key, V value)? onDispose});

  /// Return the value if it exists, otherwise null.
  V? get(K key);

  /// Update or insert the value. If capacity is exceeded, evict the LRU item.
  void put(K key, V value);

  /// Current number of items.
  int get length;
}
```

Requirements:
1. **Strict O(1) Performance**:
   - `get`, `put` must be O(1) on average.
2. **Features**:
   - **onDispose**: If an item is evicted (due to capacity), call this callback. Do NOT call onDispose if an item is merely updated/overwritten.
3. **Type Safety**: Use generics.
