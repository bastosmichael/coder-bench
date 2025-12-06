
import 'dart:async';
import 'package:test/test.dart';
import '../../src/task_queue.dart';

void main() {
  test('Concurrency Limit', () async {
    final q = TaskQueue(concurrency: 2);
    int maxRunning = 0;
    int running = 0;

    Future<int> task() async {
      running++;
      if (running > maxRunning) maxRunning = running;
      await Future.delayed(Duration(milliseconds: 50));
      running--;
      return 1;
    }

    final futures = List.generate(5, (_) => q.add(task));
    await Future.wait(futures);
    
    expect(maxRunning, lessThanOrEqualTo(2));
  });

  test('Retries', () async {
    final q = TaskQueue(concurrency: 1, maxRetries: 2);
    int attempts = 0;

    Future<String> flaky() async {
      attempts++;
      if (attempts <= 2) {
        throw Exception('fail');
      }
      return 'success';
    }

    final res = await q.add(flaky);
    expect(res, equals('success'));
    expect(attempts, equals(3));
  });
}
