import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const users = [
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
];
const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
  }

  type Query {
    getUser(id: ID!): User
    listUsers(limit: Int): [User!]!
  }
`;

const resolvers = {
  Query: {
    getUser: (_: unknown, { id }: { id: string }) => users.find((user) => user.id === id),
    listUsers: (_: unknown, { limit }: { limit: number }) => users.slice(0, limit),
  },
};
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4999 },
});

console.log(`🚀  Server ready at: ${url}`);
