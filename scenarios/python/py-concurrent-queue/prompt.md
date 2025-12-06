
You are a Python Concurrency Expert.

Implement a `TaskQueue` using `asyncio` that handles concurrency management, rate limiting, and retries.

```python
import asyncio
from typing import TypeVar, Callable, Awaitable, Optional

T = TypeVar('T')

class TaskQueue:
    def __init__(self, concurrency: int, rate_limit: Optional[dict] = None, max_retries: int = 0):
        """
        :param concurrency: Max execution slots.
        :param rate_limit: {'tokens': int, 'interval': float}
        :param max_retries: Max attempts on failure.
        """
        pass

    async def add(self, task_fn: Callable[[], Awaitable[T]]) -> T:
        """Add task to queue and await result."""
        pass
        
    def status(self) -> dict:
        """Returns {'pending': int, 'running': int}"""
        pass
```

Requirements:
1. **Concurrency**: Use `asyncio.Semaphore` or similar.
2. **Rate Limiting**: Token bucket or sliding window.
3. **Retries**: Exponential backoff.

Output full code.
