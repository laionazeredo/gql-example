import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ApolloServer } from '@apollo/server';
import { createTestServer, executeQuery } from './test-setup.js';

describe('GraphQL API Performance Tests', () => {
  let server: ApolloServer;

  beforeAll(async () => {
    server = createTestServer();
    await server.start();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('Performance Requirements', () => {
    it('should resolve getUser query within 100ms', async () => {
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

      const startTime = performance.now();
      const response = await executeQuery(server, query, { id: '1' });
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Verify the query executed successfully
      const result = response.body as any;
      expect(result.kind).toBe('single');
      expect(result.singleResult.errors).toBeUndefined();
      expect(result.singleResult.data?.getUser).toBeDefined();

      // Performance assertion
      expect(executionTime).toBeLessThan(100);

      // Log performance for monitoring
      console.log(`getUser query executed in ${executionTime.toFixed(2)}ms`);
    });

    it('should resolve listUsers query within 100ms', async () => {
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

      const startTime = performance.now();
      const response = await executeQuery(server, query);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Verify the query executed successfully
      const result = response.body as any;
      expect(result.kind).toBe('single');
      expect(result.singleResult.errors).toBeUndefined();
      expect(result.singleResult.data?.listUsers).toHaveLength(2);

      // Performance assertion
      expect(executionTime).toBeLessThan(100);

      // Log performance for monitoring
      console.log(`listUsers query executed in ${executionTime.toFixed(2)}ms`);
    });

    it('should resolve listUsers with limit within 100ms', async () => {
      const query = `
        query ListUsers($limit: Int) {
          listUsers(limit: $limit) {
            id
            name
          }
        }
      `;

      const startTime = performance.now();
      const response = await executeQuery(server, query, { limit: 1 });
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Verify the query executed successfully
      const result = response.body as any;
      expect(result.kind).toBe('single');
      expect(result.singleResult.errors).toBeUndefined();
      expect(result.singleResult.data?.listUsers).toHaveLength(1);

      // Performance assertion
      expect(executionTime).toBeLessThan(100);

      // Log performance for monitoring
      console.log(`listUsers with limit query executed in ${executionTime.toFixed(2)}ms`);
    });

    describe('Performance Monitoring', () => {
      it('should maintain performance under load (multiple consecutive queries)', async () => {
        const query = `
          query GetUser($id: ID!) {
            getUser(id: $id) {
              id
              name
            }
          }
        `;

        const executionTimes: number[] = [];
        const iterations = 10;

        for (let i = 0; i < iterations; i++) {
          const startTime = performance.now();
          await executeQuery(server, query, { id: '1' });
          const endTime = performance.now();
          executionTimes.push(endTime - startTime);
        }

        // Calculate average execution time
        const averageTime = executionTimes.reduce((sum, time) => sum + time, 0) / iterations;

        // Assert that average time is within 100ms
        expect(averageTime).toBeLessThan(100);

        // Assert that no single query took more than 150ms (allowing for some variance)
        const maxTime = Math.max(...executionTimes);
        expect(maxTime).toBeLessThan(150);

        console.log(`Average execution time over ${iterations} iterations: ${averageTime.toFixed(2)}ms`);
        console.log(`Maximum execution time: ${maxTime.toFixed(2)}ms`);
      });

      it('should handle concurrent queries efficiently', async () => {
        const query = `
          query {
            listUsers {
              id
              name
            }
          }
        `;

        const concurrentQueries = 5;
        const promises = Array(concurrentQueries).fill(null).map(() =>
          executeQuery(server, query)
        );

        const startTime = performance.now();
        await Promise.all(promises);
        const endTime = performance.now();
        const totalTime = endTime - startTime;

        // For concurrent queries, we expect the total time to be reasonable
        // (not 5x the single query time due to efficient handling)
        expect(totalTime).toBeLessThan(200); // Allow some overhead for concurrency

        console.log(`${concurrentQueries} concurrent queries completed in ${totalTime.toFixed(2)}ms`);
      });
    });
  });
});
