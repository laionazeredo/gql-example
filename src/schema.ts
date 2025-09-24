import { users } from './data.ts';

export const typeDefs = `#graphql
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

export const resolvers = {
  Query: {
    getUser: (_: unknown, { id }: { id: string }) => users.find((user) => user.id === id) || null,
    listUsers: (_: unknown, { limit }: { limit: number }) => users.slice(0, limit),
  },
};
