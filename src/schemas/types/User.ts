import { gql } from 'apollo-server-koa';
import { DateTimeResolver } from 'graphql-scalars';

import type { PostCreateInput } from './Post';

interface UserCreateInput {
  email: string;
  name?: string;
  posts?: PostCreateInput[];
}

interface UserUniqueInput {
  id?: number;
  email?: string;
}

const typeDef = gql`
  type User {
    email: String!
    id: Int!
    name: String
    posts: [Post!]!
  }

  input UserCreateInput {
    email: String!
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
    Users: (_root, _args, context) => {
      return context.prisma.user.findMany();
    },
    allUsers: (_root, _args, context) => {
      return context.prisma.user.findMany();
    },
    draftsByUser: (_root, args: { userUniqueInput: UserUniqueInput }, context) => {
      return context.prisma.user
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
    signupUser: (_root, args: { data: UserCreateInput }, context) => {
      const postData = args.data.posts?.map((post) => {
        return { title: post.title, content: post.content || undefined };
      });

      return context.prisma.user.create({
        data: {
          name: args.data.name,
          email: args.data.email,
          posts: {
            create: postData,
          },
        },
      });
    },
  },
  DateTime: DateTimeResolver,
  User: {
    posts: (root, _args, context) => {
      return context.prisma.user
        .findUnique({
          where: { id: root?.id },
        })
        .posts();
    },
  },
};

export { typeDef, resolvers };
