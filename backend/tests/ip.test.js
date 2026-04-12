const { getClientIP, isValidIP } = require('../src/utils/ip');

describe('IP 提取和验证工具测试', () => {
  describe('getClientIP', () => {
    test('应该从 X-Forwarded-For 中提取 IP', () => {
      const req = {
        headers: {
          'x-forwarded-for': '192.168.1.100'
        }
      };

      expect(getClientIP(req)).toBe('192.168.1.100');
    });

    test('应该从多个 X-Forwarded-For IP 中提取第一个', () => {
      const req = {
        headers: {
          'x-forwarded-for': '192.168.1.100, 10.0.0.1, 172.16.0.1'
        }
      };

      expect(getClientIP(req)).toBe('192.168.1.100');
    });

    test('应该从 req.ip 中提取 IP (无 X-Forwarded-For)', () => {
      const req = {
        headers: {},
        ip: '192.168.1.200'
      };

      expect(getClientIP(req)).toBe('192.168.1.200');
    });

    test('应该从 req.connection.remoteAddress 中提取 IP', () => {
      const req = {
        headers: {},
        connection: {
          remoteAddress: '192.168.1.200'
        }
      };

      expect(getClientIP(req)).toBe('192.168.1.200');
    });

    test('X-Forwarded-For 优先级高于 req.ip', () => {
      const req = {
        headers: {
          'x-forwarded-for': '10.0.0.1'
        },
        ip: '192.168.1.100'
      };

      expect(getClientIP(req)).toBe('10.0.0.1');
    });

    test('无法提取 IP 时应返回 null', () => {
      const req = {
        headers: {},
        connection: {}
      };

      expect(getClientIP(req)).toBeNull();
    });

    test('应该处理空的 X-Forwarded-For', () => {
      const req = {
        headers: {
          'x-forwarded-for': ''
        },
        ip: '192.168.1.100'
      };

      expect(getClientIP(req)).toBe('192.168.1.100');
    });

    test('应该处理包含空格的 X-Forwarded-For', () => {
      const req = {
        headers: {
          'x-forwarded-for': '  192.168.1.100  ,  10.0.0.1  '
        }
      };

      expect(getClientIP(req)).toBe('192.168.1.100');
    });
  });

  describe('isValidIP', () => {
    describe('IPv4 验证', () => {
      test('应该验证有效的 IPv4 地址', () => {
        expect(isValidIP('192.168.1.1')).toBe(true);
        expect(isValidIP('10.0.0.1')).toBe(true);
        expect(isValidIP('172.16.0.1')).toBe(true);
        expect(isValidIP('255.255.255.255')).toBe(true);
        expect(isValidIP('0.0.0.0')).toBe(true);
        expect(isValidIP('127.0.0.1')).toBe(true);
      });

      test('应该拒绝明显的无效 IP', () => {
        expect(isValidIP('999.999.999.999')).toBe(false);
        expect(isValidIP('abc.def.ghi.jkl')).toBe(false);
      });
    });

    describe('IPv6 验证', () => {
      test('应该验证有效的 IPv6 地址', () => {
        expect(isValidIP('::1')).toBe(true);
        expect(isValidIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
        expect(isValidIP('fe80::1')).toBe(true);
        expect(isValidIP('::')).toBe(true);
      });

      test('应该拒绝明显的无效 IPv6', () => {
        expect(isValidIP('xyz:::invalid')).toBe(false);
      });
    });

    describe('边界情况', () => {
      test('应该拒绝 null 和 undefined', () => {
        expect(isValidIP(null)).toBe(false);
        expect(isValidIP(undefined)).toBe(false);
      });

      test('应该拒绝空字符串', () => {
        expect(isValidIP('')).toBe(false);
      });

      test('应该拒绝非字符串类型', () => {
        expect(isValidIP(123)).toBe(false);
        expect(isValidIP({})).toBe(false);
        expect(isValidIP([])).toBe(false);
      });
    });
  });
});
