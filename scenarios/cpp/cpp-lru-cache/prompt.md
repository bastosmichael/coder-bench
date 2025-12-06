
You are a C++ Expert.

Implement a generic LRU Cache in C++17 as a header-only library in `src/lru_cache.hpp`.

The implementation must be a single class template `LRUCache<K, V>`.

```cpp
#pragma once
#include <optional>
#include <list>
#include <unordered_map>
#include <functional>

template<typename K, typename V>
class LRUCache {
public:
    using DisposeCallback = std::function<void(const K&, const V&)>;

    // Constructor
    LRUCache(size_t capacity, DisposeCallback on_dispose = nullptr);

    // Returns value if exists, moves to front (MRU). Returns std::nullopt if not found.
    // Note: Since V might not be copyable easily, returning pointer or reference is common, 
    // but strict requirement asks for optional copy or similar. 
    // Let's stick to pointer for simplicity in interface or optional if V is small.
    // Let's return std::optional<V> for simplicity, assuming V is copyable.
    std::optional<V> get(const K& key);

    // Inserts or updates. If capacity exceeded, evicts LRU.
    // If evicted, calls on_dispose.
    void put(const K& key, const V& value);

    // Returns current size
    size_t size() const;
};
```

Requirements:
1.  **O(1)** time complexity for `get` and `put`.
2.  Use `std::list` for the doubly linked list and `std::unordered_map` for the lookup.
3.  **Memory Safety**: No raw pointers unless absolutely necessary (iterators are fine).
4.  **Header Only**: Provide the full implementation in the header file.
5.  **Strict**: Syntax must compile with `-Wall -Werror`.

Output the full content of `src/lru_cache.hpp`.
