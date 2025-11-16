import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Mock Express app and fetch for testing
const BASE_URL = 'http://localhost:3001';

describe('Contact API Endpoint', () => {
  describe('POST /api/contact', () => {
    it('should accept valid contact form submission', async () => {
      const payload = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message'
      };

      const response = await fetch(`${BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('received');
    });

    it('should reject submission without name', async () => {
      const payload = {
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message'
      };

      const response = await fetch(`${BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('required');
    });

    it('should reject submission without email', async () => {
      const payload = {
        name: 'John Doe',
        subject: 'Test Subject',
        message: 'This is a test message'
      };

      const response = await fetch(`${BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('required');
    });

    it('should reject submission without subject', async () => {
      const payload = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message'
      };

      const response = await fetch(`${BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('required');
    });

    it('should reject submission without message', async () => {
      const payload = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject'
      };

      const response = await fetch(`${BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('required');
    });

    it('should reject invalid email format', async () => {
      const payload = {
        name: 'John Doe',
        email: 'invalid-email',
        subject: 'Test Subject',
        message: 'This is a test message'
      };

      const response = await fetch(`${BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid email');
    });

    it('should handle whitespace in fields', async () => {
      const payload = {
        name: '  John Doe  ',
        email: '  john@example.com  ',
        subject: '  Test Subject  ',
        message: '  This is a test message  '
      };

      const response = await fetch(`${BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should accept various valid email formats', async () => {
      const emailVariations = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user123@subdomain.example.com'
      ];

      for (const email of emailVariations) {
        const payload = {
          name: 'John Doe',
          email,
          subject: 'Test Subject',
          message: 'This is a test message'
        };

        const response = await fetch(`${BASE_URL}/api/contact`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
      }
    });
  });
});
