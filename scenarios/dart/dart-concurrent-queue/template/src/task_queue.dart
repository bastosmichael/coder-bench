
import 'dart:async';

class TaskQueue {
  TaskQueue({
    required int concurrency,
    Map<String, dynamic>? rateLimit,
    int maxRetries = 0,
  });

  Future<T> add<T>(Future<T> Function() task) {
    // TODO: implement
    throw UnimplementedError();
  }

  Map<String, int> status() {
    return {'pending': 0, 'running': 0};
  }
}
