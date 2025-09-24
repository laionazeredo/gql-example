import { ApolloServer } from '@apollo/server';
import { typeDefs, resolvers } from './main.js';

export function createTestServer() {
  return new ApolloServer({
    typeDefs,
    resolvers,
  });
}

export async function executeQuery(server: ApolloServer, query: string, variables?: any) {
  const response = await server.executeOperation({
    query,
    variables,
  });

  return response;
}
