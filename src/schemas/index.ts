import { makeExecutableSchema } from '@graphql-tools/schema';
import { gql } from 'apollo-server-koa';
import merge from 'lodash/merge';

import { typeDef as User, resolvers as UserResolvers } from './types/User';
import { typeDef as Post, resolvers as PostResolvers } from './types/Post';

const SchemaDefinition = gql`
  schema {
    query: Query
    mutation: Mutation
  }
`;

const Query = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    null: Boolean
  }
`;

const resolvers = {};

export default makeExecutableSchema({
  typeDefs: [SchemaDefinition, Query, User, Post],
  resolvers: merge(resolvers, UserResolvers, PostResolvers),
});
