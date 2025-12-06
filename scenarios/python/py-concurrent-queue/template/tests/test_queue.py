
import pytest
import asyncio
import time
from src.task_queue import TaskQueue

@pytest.mark.asyncio
async def test_concurrency():
    q = TaskQueue(concurrency=2)
    max_running = 0
    running = 0
    
    async def task():
        nonlocal running, max_running
        running += 1
        max_running = max(max_running, running)
        await asyncio.sleep(0.05)
        running -= 1
        return 1

    tasks = [q.add(task) for _ in range(5)]
    await asyncio.gather(*tasks)
    assert max_running <= 2

@pytest.mark.asyncio
async def test_retries():
    q = TaskQueue(concurrency=1, max_retries=2)
    attempts = 0
    
    async def flaky():
        nonlocal attempts
        attempts += 1
        if attempts <= 2:
            raise ValueError("fail")
        return "success"
        
    res = await q.add(flaky)
    assert res == "success"
    assert attempts == 3
