import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ApolloServer } from '@apollo/server';
import { createTestServer, executeQuery } from './test-setup.js';

describe('GraphQL API Tests', () => {
  let server: ApolloServer;

  beforeAll(async () => {
    server = createTestServer();
    await server.start();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('getUser Query', () => {
    it('should return a user by ID', async () => {
      const query = `
        query GetUser($id: ID!) {
          getUser(id: $id) {
            id
            name
            email
            age
          }
        }
      `;

      const response = await executeQuery(server, query, { id: '1' });

      // Use type assertion to handle the response structure
      const result = response.body as any;

      expect(result.kind).toBe('single');
      expect(result.singleResult.errors).toBeUndefined();
      expect(result.singleResult.data?.getUser).toEqual({
        id: '1',
        name: 'Laion',
        email: 'laion@example.com',
        age: 30,
      });
    });

    it('should return null for non-existent user', async () => {
      const query = `
        query GetUser($id: ID!) {
          getUser(id: $id) {
            id
            name
            email
            age
          }
        }
      `;

      const response = await executeQuery(server, query, { id: '999' });
      const result = response.body as any;

      expect(result.kind).toBe('single');
      expect(result.singleResult.errors).toBeUndefined();
      expect(result.singleResult.data?.getUser).toBeNull();
    });

    it('should validate required ID parameter', async () => {
      const query = `
        query {
          getUser {
            id
            name
          }
        }
      `;

      const response = await executeQuery(server, query);
      const result = response.body as any;

      expect(result.kind).toBe('single');
      expect(result.singleResult.errors).toBeDefined();
      expect(result.singleResult.errors?.[0].message).toContain('Field "getUser" argument "id" of type "ID!" is required');
    });
  });

  describe('listUsers Query', () => {
    it('should return all users when no limit is specified', async () => {
      const query = `
        query {
          listUsers {
            id
            name
            email
            age
          }
        }
      `;

      const response = await executeQuery(server, query);
      const result = response.body as any;

      expect(result.kind).toBe('single');
      expect(result.singleResult.errors).toBeUndefined();
      expect(result.singleResult.data?.listUsers).toHaveLength(2);
      expect(result.singleResult.data?.listUsers).toEqual([
        {
          id: '1',
          name: 'Laion',
          email: 'laion@example.com',
          age: 30,
        },
        {
          id: '2',
          name: 'John Doe',
          email: 'john@example.com',
          age: 25,
        },
      ]);
    });

    it('should return limited users when limit is specified', async () => {
      const query = `
        query ListUsers($limit: Int) {
          listUsers(limit: $limit) {
            id
            name
          }
        }
      `;

      const response = await executeQuery(server, query, { limit: 1 });
      const result = response.body as any;

      expect(result.kind).toBe('single');
      expect(result.singleResult.errors).toBeUndefined();
      expect(result.singleResult.data?.listUsers).toHaveLength(1);
      expect(result.singleResult.data?.listUsers[0].id).toBe('1');
    });

    it('should return empty array when limit is 0', async () => {
      const query = `
        query ListUsers($limit: Int) {
          listUsers(limit: $limit) {
            id
            name
          }
        }
      `;

      const response = await executeQuery(server, query, { limit: 0 });
      const result = response.body as any;

      expect(result.kind).toBe('single');
      expect(result.singleResult.errors).toBeUndefined();
      expect(result.singleResult.data?.listUsers).toHaveLength(0);
    });
  });

  describe('Query Validation', () => {
    it('should reject invalid queries', async () => {
      const query = `
        query {
          invalidQuery {
            field
          }
        }
      `;

      const response = await executeQuery(server, query);
      const result = response.body as any;

      expect(result.kind).toBe('single');
      expect(result.singleResult.errors).toBeDefined();
      expect(result.singleResult.errors?.[0].message).toContain('Cannot query field "invalidQuery"');
    });
  });
});
