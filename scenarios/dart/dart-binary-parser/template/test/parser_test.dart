
import 'dart:typed_data';
import 'package:test/test.dart';
import '../../src/parser.dart'; // Depending on layout, might need adjustment

// Helper to create header
Uint8List createHeader(int type) {
  return Uint8List.fromList([0xAF, 0x01, type]);
}

Uint8List withChecksum(List<int> data) {
  int sumVal = 0;
  for (var b in data) {
    sumVal += b;
  }
  sumVal = sumVal % (1 << 32); // 2^32
  
  final bd = ByteData(4);
  bd.setUint32(0, sumVal, Endian.big);
  
  final b = BytesBuilder();
  b.add(data);
  b.add(bd.buffer.asUint8List());
  return b.toBytes();
}

void main() {
  test('Login Packet', () {
    final header = createHeader(1);
    final userLen = 5;
    final username = 'alice'.codeUnits;
    final hash = List.filled(32, 0xAA);
    
    final payload = BytesBuilder();
    payload.add(header);
    payload.addByte(userLen);
    payload.add(username);
    payload.add(hash);
    
    final packet = withChecksum(payload.toBytes());
    final res = parsePacket(packet);
    
    expect(res['type'], equals('Login'));
    expect(res['username'], equals('alice'));
  });
  
  test('Order Packet', () {
    // ID=123, Symbol=AAPL, Side=1, Price=150.5, Qty=100
    final header = createHeader(2);
    final body = ByteData(25); // 8+4+1+8+4
    body.setInt64(0, 123, Endian.big);
    // Symbol AAPL
    body.setUint8(8, 'A'.codeUnitAt(0));
    body.setUint8(9, 'A'.codeUnitAt(0));
    body.setUint8(10, 'P'.codeUnitAt(0));
    body.setUint8(11, 'L'.codeUnitAt(0));
    
    body.setInt8(12, 1);
    body.setFloat64(13, 150.5, Endian.big);
    body.setUint32(21, 100, Endian.big);
    
    final payload = BytesBuilder();
    payload.add(header);
    payload.add(body.buffer.asUint8List());
    
    final packet = withChecksum(payload.toBytes());
    final res = parsePacket(packet);
    
    expect(res['type'], equals('Order'));
    expect(res['symbol'], equals('AAPL'));
    expect(res['price'], equals(150.5));
  });
  
  test('Underflow', () {
    expect(() => parsePacket([0xAF]), throwsException);
  });
}
