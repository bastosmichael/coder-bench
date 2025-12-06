
import pytest
from src.lru_cache import LRUCache

def test_lru_basic():
    cache = LRUCache(2)
    cache.put(1, 1)
    cache.put(2, 2)
    assert cache.get(1) == 1
    cache.put(3, 3) # evicts 2
    assert cache.get(2) is None
    cache.put(4, 4) # evicts 1
    assert cache.get(1) is None
    assert cache.get(3) == 3
    assert cache.get(4) == 4

def test_lru_update():
    cache = LRUCache(2)
    cache.put(1, 1)
    cache.put(2, 2)
    cache.put(1, 10) # 1 is now MRU
    cache.put(3, 3) # evicts 2
    assert cache.get(2) is None
    assert cache.get(1) == 10
    
def test_on_dispose():
    disposed = []
    def on_dispose(k, v):
        disposed.append((k, v))
        
    cache = LRUCache(2, on_dispose=on_dispose)
    cache.put('a', 1)
    cache.put('b', 2)
    cache.put('c', 3) # Evicts 'a'
    
    assert disposed == [('a', 1)]
    
    # Update shouldn't trigger dispose
    cache.put('b', 20)
    assert len(disposed) == 1
    
    # Manual delete? The stub didn't explicitly enforce delete in my previous step prompt, 
    # but I should check if I requested it. I added 'delete' in the prompt Requirements text in markdown 
    # but maybe not in the class signature block which usually models follow.
    # To be safe, I'll stick to what I put in the prompt blocks or typical usage. 
    # For now let's test what we asked for.
    
def test_capacity_1():
    cache = LRUCache(1)
    cache.put(1, 1)
    assert cache.get(1) == 1
    cache.put(2, 2)
    assert cache.get(1) is None
    assert cache.get(2) == 2
