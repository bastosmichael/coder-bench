
You are a Dart Concurrency Expert.

Implement a `TaskQueue` that handles concurrency management, rate limiting, and retries.

```dart
import 'dart:async';

class TaskQueue {
  /// [concurrency] is the max number of concurrent tasks.
  /// [rateLimit] is optional: {'tokens': int, 'interval': Duration}.
  /// [maxRetries] is the max number of retry attempts on failure.
  TaskQueue({
    required int concurrency,
    Map<String, dynamic>? rateLimit,
    int maxRetries = 0,
  });

  /// Add a task to the queue and await its result.
  Future<T> add<T>(Future<T> Function() task);

  /// Returns {'pending': int, 'running': int}
  Map<String, int> status();
}
```

Requirements:
1. **Concurrency**: Verify that no more than `concurrency` tasks run at once.
2. **Rate Limiting**: Simple token bucket (if provided).
3. **Retries**: Exponential backoff on error.
