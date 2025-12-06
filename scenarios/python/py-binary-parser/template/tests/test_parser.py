
import pytest
import struct
from src.parser import parse_packet

def create_header(ptype):
    return bytes([0xAF, 0x01, ptype])

def with_checksum(data):
    chk = sum(data) % (2**32)
    return data + struct.pack('>I', chk)

def test_login():
    payload = create_header(1) + bytes([5]) + b'alice' + (b'\xAA' * 32)
    packet = with_checksum(payload)
    res = parse_packet(packet)
    assert res['type'] == 'Login'
    assert res['username'] == 'alice'

def test_order():
    # ID=123, Symbol=AAPL, Side=1, Price=150.5, Qty=100
    payload = create_header(2) + struct.pack('>q4sbdI', 123, b'AAPL', 1, 150.5, 100)
    packet = with_checksum(payload)
    res = parse_packet(packet)
    assert res['type'] == 'Order'
    assert res['symbol'] == 'AAPL'
    assert res['price'] == 150.5

def test_underflow():
    with pytest.raises(Exception):
        parse_packet(b'\xAF')
