
import 'package:test/test.dart';
import '../../src/lru_cache.dart';

void main() {
  test('LRU Basic', () {
    final cache = LRUCache<int, int>(2);
    cache.put(1, 1);
    cache.put(2, 2);
    expect(cache.get(1), equals(1));
    
    cache.put(3, 3); // evicts 2
    expect(cache.get(2), isNull);
    
    cache.put(4, 4); // evicts 1
    expect(cache.get(1), isNull);
    
    expect(cache.get(3), equals(3));
    expect(cache.get(4), equals(4));
  });

  test('LRU Update', () {
    final cache = LRUCache<int, int>(2);
    cache.put(1, 1);
    cache.put(2, 2);
    cache.put(1, 10); // 1 is now MRU
    
    cache.put(3, 3); // evicts 2
    expect(cache.get(2), isNull);
    expect(cache.get(1), equals(10));
  });

  test('onDispose', () {
    final disposed = <MapEntry<String, int>>[];
    
    final cache = LRUCache<String, int>(2, onDispose: (k, v) {
      disposed.add(MapEntry(k, v));
    });
    
    cache.put('a', 1);
    cache.put('b', 2);
    cache.put('c', 3); // Evicts 'a'
    
    expect(disposed.length, equals(1));
    expect(disposed[0].key, equals('a'));
    expect(disposed[0].value, equals(1));
    
    // Update shouldn't trigger dispose
    cache.put('b', 20);
    expect(disposed.length, equals(1));
  });

  test('Capacity 1', () {
    final cache = LRUCache<int, int>(1);
    cache.put(1, 1);
    expect(cache.get(1), equals(1));
    
    cache.put(2, 2);
    expect(cache.get(1), isNull);
    expect(cache.get(2), equals(2));
  });
}
