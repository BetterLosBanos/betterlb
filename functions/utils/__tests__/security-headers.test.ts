/**
 * Security Headers Tests
 */
import { describe, it, expect } from 'vitest';
import {
  SECURITY_HEADERS,
  CSP_STRICT,
  CSP_DEVELOPMENT,
  getCSP,
  setSecurityHeaders,
  secureJson,
} from '../security-headers';

describe('Security Headers', () => {
  describe('SECURITY_HEADERS constant', () => {
    it('should include X-Content-Type-Options: nosniff', () => {
      expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff');
    });

    it('should include X-Frame-Options: DENY', () => {
      expect(SECURITY_HEADERS['X-Frame-Options']).toBe('DENY');
    });

    it('should include Strict-Transport-Security', () => {
      expect(SECURITY_HEADERS['Strict-Transport-Security']).toContain(
        'max-age=31536000'
      );
      expect(SECURITY_HEADERS['Strict-Transport-Security']).toContain(
        'includeSubDomains'
      );
      expect(SECURITY_HEADERS['Strict-Transport-Security']).toContain(
        'preload'
      );
    });

    it('should include X-XSS-Protection: 0', () => {
      expect(SECURITY_HEADERS['X-XSS-Protection']).toBe('0');
    });

    it('should include Referrer-Policy', () => {
      expect(SECURITY_HEADERS['Referrer-Policy']).toBe(
        'strict-origin-when-cross-origin'
      );
    });

    it('should include Permissions-Policy', () => {
      expect(SECURITY_HEADERS['Permissions-Policy']).toContain(
        'geolocation=()'
      );
      expect(SECURITY_HEADERS['Permissions-Policy']).toContain('microphone=()');
      expect(SECURITY_HEADERS['Permissions-Policy']).toContain('camera=()');
    });
  });

  describe('Content-Security-Policy', () => {
    it('should have strict CSP for production', () => {
      expect(CSP_STRICT).toContain("default-src 'self'");
      expect(CSP_STRICT).toContain("script-src 'self' 'unsafe-inline'");
      expect(CSP_STRICT).toContain("frame-ancestors 'none'");
    });

    it('should have development CSP that allows localhost', () => {
      expect(CSP_DEVELOPMENT).toContain("default-src 'self' 'unsafe-eval'");
      expect(CSP_DEVELOPMENT).toContain('http://localhost:*');
      expect(CSP_DEVELOPMENT).toContain('ws://localhost:*');
    });
  });

  describe('getCSP', () => {
    it('should return development CSP when ENVIRONMENT is development', () => {
      const env = { ENVIRONMENT: 'development' };
      expect(getCSP(env)).toBe(CSP_DEVELOPMENT);
    });

    it('should return strict CSP when ENVIRONMENT is not set', () => {
      expect(getCSP()).toBe(CSP_STRICT);
    });

    it('should return strict CSP when ENVIRONMENT is production', () => {
      const env = { ENVIRONMENT: 'production' };
      expect(getCSP(env)).toBe(CSP_STRICT);
    });
  });

  describe('setSecurityHeaders', () => {
    it('should add all security headers to a response', () => {
      const response = new Response('test', {
        headers: { 'Content-Type': 'text/plain' },
      });

      const secured = setSecurityHeaders(response);

      expect(secured.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(secured.headers.get('X-Frame-Options')).toBe('DENY');
      expect(secured.headers.get('X-XSS-Protection')).toBe('0');
      expect(secured.headers.get('Referrer-Policy')).toBe(
        'strict-origin-when-cross-origin'
      );
      expect(secured.headers.get('Permissions-Policy')).toBeDefined();
      expect(secured.headers.get('Content-Security-Policy')).toBeDefined();
    });

    it('should add HSTS header only for HTTPS URLs', () => {
      // Create a response with HTTPS URL
      const httpsResponse = new Response('test');
      Object.defineProperty(httpsResponse, 'url', {
        value: 'https://example.com',
        writable: false,
      });

      const securedHttps = setSecurityHeaders(httpsResponse);
      expect(securedHttps.headers.get('Strict-Transport-Security')).toBe(
        'max-age=31536000; includeSubDomains; preload'
      );

      // Create a response with HTTP URL
      const httpResponse = new Response('test');
      Object.defineProperty(httpResponse, 'url', {
        value: 'http://example.com',
        writable: false,
      });

      const securedHttp = setSecurityHeaders(httpResponse);
      expect(securedHttp.headers.get('Strict-Transport-Security')).toBeNull();
    });

    it('should preserve existing headers', () => {
      const response = new Response('test', {
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'custom-value',
        },
      });

      const secured = setSecurityHeaders(response);

      expect(secured.headers.get('Content-Type')).toBe('application/json');
      expect(secured.headers.get('X-Custom-Header')).toBe('custom-value');
    });
  });

  describe('secureJson', () => {
    it('should create a JSON response with security headers', () => {
      const data = { message: 'test' };
      const response = secureJson(data);

      expect(response.headers.get('Content-Type')).toContain(
        'application/json'
      );
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('Content-Security-Policy')).toBeDefined();
    });

    it('should add cache headers when config is provided', () => {
      const data = { message: 'test' };
      const response = secureJson(data, 'static');

      expect(response.headers.get('Cache-Control')).toContain('max-age=3600');
    });

    it('should support custom status codes', () => {
      const data = { error: 'Not found' };
      const response = secureJson(data, 'none', 404);

      expect(response.status).toBe(404);
    });
  });
});
