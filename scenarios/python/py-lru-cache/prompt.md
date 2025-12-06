
You are a Principal Software Engineer.

I have provided a stub implementation in `src/lru_cache.py`.
Your task is to implement a **production-grade**, high-performance LRU Cache in Python.

```python
from typing import TypeVar, Generic, Optional

K = TypeVar('K')
V = TypeVar('V')

class LRUCache(Generic[K, V]):
    def __init__(self, capacity: int, on_dispose: Optional[callable] = None):
        """
        :param capacity: Max number of items.
        :param on_dispose: Callback function(key, value) called when item is evicted or manually deleted.
        """
        pass

    def get(self, key: K) -> Optional[V]:
        """Return the value of the key if it exists, otherwise None."""
        pass

    def put(self, key: K, value: V) -> None:
        """Update or insert the value. If capacity is exceeded, evict the LRU item."""
        pass
        
    def __len__(self) -> int:
        pass
```

Requirements:
1. **Strict O(1) Performance**: 
   - `get`, `put` must be O(1) on average. 
   - You may use `collections.OrderedDict`.
2. **Features**:
   - **on_dispose**: If an item is evicted (due to capacity) or overwritten? No, prompt says for TS "evicted or deleted". For `put` update, usually on_dispose is NOT called. Let's stick to: "If an item is evicted (due to valid capacity)". (Wait, TS prompt said: "If an item is evicted (due to valid capacity) or deleted (manually)... Do NOT call onDispose if an item is merely updated/overwritten"). I will match that logic.
   - Note: The stub doesn't have `delete`. I should add `delete` to match TS or keep it simple. TS has `delete` and `has`. I should probably add them to be "identical".
   
   Let's update the stub in prompt to match TS interface more closely.

```python
    def delete(self, key: K) -> bool:
        """Remove key. Return True if found."""
        pass

    def __contains__(self, key: K) -> bool:
        """Check if key exists."""
        pass
```

3. **Type Hints**: Use strict typing.

Output the full content of `src/lru_cache.py`.
