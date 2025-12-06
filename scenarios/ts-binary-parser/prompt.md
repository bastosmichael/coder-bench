
You are a Systems Engineer working on a high-frequency trading platform.

I have provided a stub in `src/parser.ts`.
Your task is to implement a recursive binary packet parser that reads strict binary data from a buffer.

Protocol Definition:
1. **Header**: 
   - Magic Byte (1 byte): Must be `0xAF`. If not, throw "Invalid magic byte".
   - Version (1 byte): Must be `1`. If not, throw "Unsupported version".
   - Packet Type (1 byte): `0x01` = Login, `0x02` = Order, `0x03` = Heartbeat.

2. **Payload** (Depends on Type):
   - **Login**: 
     - Username Length (1 byte, UInt8)
     - Username (ASCII string of length N)
     - Password Hash (32 bytes, Fixed buffer)
   - **Order**:
     - Order ID (8 bytes, BigInt64 Big Endian)
     - Symbol (4 bytes, ASCII string, e.g., "AAPL")
     - Side (1 byte): `0` = Buy, `1` = Sell.
     - Price (8 bytes, Double Big Endian)
     - Quantity (4 bytes, UInt32 Big Endian)
   - **Heartbeat**:
     - Timestamp (8 bytes, BigInt64 Big Endian)

3. **Checksum**:
   - The last 4 bytes of the total packet are a CRC32 checksum of the *entire* packet up to that point (Header + Payload).
   - You must verify this checksum. If mismatch, throw "Invalid checksum". note: You can use a simple CRC32 implementation or mocked function if strictly needed, but preferably implement a simple CRC algorithm or simply sum of bytes to simulate a check if CRC32 is too complex to inline. 
   - AS A SIMPLIFICATION: The "Checksum" for this implementation shall be the **Simples SUM of all previous bytes modulo 2^32**.

```ts
export type Packet = 
  | { type: 'Login'; username: string; hash: string } // hash as hex string
  | { type: 'Order'; id: bigint; symbol: string; side: 'Buy' | 'Sell'; price: number; quantity: number }
  | { type: 'Heartbeat'; timestamp: bigint };

export function parsePacket(buffer: Buffer): Packet {
  // your implementation
}
```

Requirements:
- Strict bounds checking. If buffer is too short, throw "Buffer underflow".
- Handle endianness correctly (Big Endian for numbers).
- No external libraries.
- Strict Types.
