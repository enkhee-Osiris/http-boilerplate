import { gql } from 'apollo-server-core';
import { DateTimeResolver } from 'graphql-scalars';
import { hasher } from '../../utils/user.util';

import prismaClient from '../../utils/prismaClient';

const typeDef = gql`
  type User {
    id: Int!
    email: String!
    salt: String!
    password: String!
    name: String
    posts: [Post!]!
  }

  input UserCreateInput {
    email: String!
    password: String!
    name: String
    posts: [PostCreateInput!]
  }

  input UserUniqueInput {
    email: String
    id: Int
  }

  extend type Query {
    Users: [User!]!
    allUsers: [User!]!
    draftsByUser(userUniqueInput: UserUniqueInput!): [Post]
  }

  extend type Mutation {
    signupUser(data: UserCreateInput!): User!
  }
`;

const resolvers = {
  Query: {
    Users: (_root, _args) => {
      return prismaClient.user.findMany();
    },
    allUsers: (_root, _args) => {
      return prismaClient.user.findMany();
    },
    draftsByUser: (_root, args: { userUniqueInput: UserUniqueInput }) => {
      return prismaClient.user
        .findUnique({
          where: {
            id: args.userUniqueInput.id || undefined,
            email: args.userUniqueInput.email || undefined,
          },
        })
        .posts({
          where: {
            published: false,
          },
        });
    },
  },
  Mutation: {
    signupUser: (_root, args: { data: UserCreateInput }) => {
      const postData = args.data.posts?.map((post) => {
        return { title: post.title, content: post.content || undefined };
      });

      const { salt, hash: password } = hasher(args.data.password);

      return prismaClient.user.create({
        data: {
          name: args.data.name,
          email: args.data.email,
          salt,
          password,
          posts: {
            create: postData,
          },
        },
      });
    },
  },
  DateTime: DateTimeResolver,
  User: {
    posts: (root, _args) => {
      return prismaClient.user
        .findUnique({
          where: { id: root?.id },
        })
        .posts();
    },
  },
};

export { typeDef, resolvers };
