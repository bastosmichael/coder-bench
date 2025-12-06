
import { describe, expect, it } from 'vitest';
import { parsePacket } from '../src/parser';

describe('Binary Parser', () => {

    function createHeader(type: number): Buffer {
        return Buffer.from([0xAF, 0x01, type]);
    }

    function calculateChecksum(buf: Buffer): number {
        let sum = 0;
        for (const byte of buf) sum += byte;
        return sum >>> 0; // uint32
    }

    function withChecksum(buf: Buffer): Buffer {
        const sum = calculateChecksum(buf);
        const checksumBuf = Buffer.alloc(4);
        checksumBuf.writeUInt32BE(sum, 0);
        return Buffer.concat([buf, checksumBuf]);
    }

    it('parses Login packet', () => {
        const header = createHeader(0x01);
        const username = Buffer.from('alice');
        const uLen = Buffer.from([username.length]);
        const hash = Buffer.alloc(32).fill(0xAA);

        const payload = Buffer.concat([header, uLen, username, hash]);
        const packet = withChecksum(payload);

        const result = parsePacket(packet);

        if (result.type !== 'Login') throw new Error('Wrong type');
        expect(result.username).toBe('alice');
        expect(result.hash).toBe(hash.toString('hex'));
    });

    it('parses Order packet', () => {
        const header = createHeader(0x02);
        const id = Buffer.alloc(8); id.writeBigInt64BE(123456789n);
        const symbol = Buffer.from('AAPL');
        const side = Buffer.from([1]); // Sell
        const price = Buffer.alloc(8); price.writeDoubleBE(150.50);
        const qty = Buffer.alloc(4); qty.writeUInt32BE(100);

        const payload = Buffer.concat([header, id, symbol, side, price, qty]);
        const packet = withChecksum(payload);

        const result = parsePacket(packet);
        if (result.type !== 'Order') throw new Error('Wrong type');
        expect(result.id).toBe(123456789n);
        expect(result.symbol).toBe('AAPL');
        expect(result.side).toBe('Sell');
        expect(result.price).toBe(150.50);
        expect(result.quantity).toBe(100);
    });

    it('throws on invalid magic byte', () => {
        const buf = Buffer.from([0x00, 0x01, 0x03]); // Wrong magic
        expect(() => parsePacket(buf)).toThrow(/magic/i);
    });

    it('throws on invalid checksum', () => {
        const header = createHeader(0x03); // Heartbeat
        const time = Buffer.alloc(8);
        const payload = Buffer.concat([header, time]);
        const packet = withChecksum(payload);

        // Corrupt last byte
        packet[packet.length - 1] ^= 0xFF;

        expect(() => parsePacket(packet)).toThrow(/checksum/i);
    });

    it('throws on underflow', () => {
        const header = createHeader(0x01);
        expect(() => parsePacket(header)).toThrow(/underflow|short/i);
    });
});
