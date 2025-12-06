
#include "../src/lru_cache.hpp"
#include <iostream>
#include <cassert>
#include <string>
#include <vector>

void test_basic() {
    LRUCache<int, int> cache(2);
    cache.put(1, 1);
    cache.put(2, 2);
    assert(cache.get(1).value() == 1);
    cache.put(3, 3); // evicts 2
    assert(!cache.get(2).has_value());
    cache.put(4, 4); // evicts 1
    assert(!cache.get(1).has_value());
    assert(cache.get(3).value() == 3);
    assert(cache.get(4).value() == 4);
    std::cout << "test_basic passed\n";
}

void test_update() {
    LRUCache<int, int> cache(2);
    cache.put(1, 1);
    cache.put(2, 2);
    cache.put(1, 10); // Update 1, it becomes MRU
    cache.put(3, 3); // Should evict 2, NOT 1
    
    assert(!cache.get(2).has_value());
    assert(cache.get(1).value() == 10);
    assert(cache.get(3).value() == 3);
    std::cout << "test_update passed\n";
}

void test_dispose() {
    std::vector<std::pair<std::string, int>> evicted;
    auto callback = [&](const std::string& k, const int& v) {
        evicted.push_back({k, v});
    };
    
    LRUCache<std::string, int> cache(2, callback);
    cache.put("a", 1);
    cache.put("b", 2);
    cache.put("c", 3); // Evicts "a"
    
    assert(evicted.size() == 1);
    assert(evicted[0].first == "a");
    assert(evicted[0].second == 1);
    
    cache.put("b", 20); // Update, should not dispose
    assert(evicted.size() == 1);
    
    std::cout << "test_dispose passed\n";
}

int main() {
    try {
        test_basic();
        test_update();
        test_dispose();
        std::cout << "All tests passed (3 passed)\n";
        // Output format matching regex: (\d+) passed
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "Test failed: " << e.what() << "\n";
        return 1;
    }
}
