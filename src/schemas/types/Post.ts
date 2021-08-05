import { gql } from 'apollo-server-core';
import { DateTimeResolver } from 'graphql-scalars';

import HttpError from '../../utils/HttpError';
import prismaClient from '../../utils/prismaClient';

const typeDef = gql`
  scalar DateTime

  type Post {
    id: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    title: String!
    content: String
    published: Boolean!
    author: User
  }

  input PostCreateInput {
    content: String
    title: String!
  }

  input PostOrderByUpdatedAtInput {
    updatedAt: SortOrder!
  }

  enum SortOrder {
    asc
    desc
  }

  extend type Query {
    Posts: [Post!]!
    postById(id: Int): Post
    feed(orderBy: PostOrderByUpdatedAtInput, searchString: String, skip: Int, take: Int): [Post!]!
  }

  extend type Mutation {
    createDraft(authorEmail: String!, data: PostCreateInput!): Post
    togglePublishPost(id: Int!): Post
    deletePost(id: Int!): Post
  }
`;

const resolvers = {
  Query: {
    Posts: (_root, _args) => {
      return prismaClient.post.findMany();
    },
    allUsers: (_root, _args) => {
      return prismaClient.user.findMany();
    },
    postById: (_root, args: { id: number }) => {
      return prismaClient.post.findUnique({
        where: { id: args.id || undefined },
      });
    },
    feed: (
      _root,
      args: {
        searchString: string;
        skip: number;
        take: number;
        orderBy: PostOrderByUpdatedAtInput;
      },
    ) => {
      const or = args.searchString
        ? {
            OR: [
              { title: { contains: args.searchString } },
              { content: { contains: args.searchString } },
            ],
          }
        : {};

      return prismaClient.post.findMany({
        where: {
          published: true,
          ...or,
        },
        take: args?.take,
        skip: args?.skip,
        orderBy: args?.orderBy,
      });
    },
  },
  Mutation: {
    createDraft: (_root, args: { data: PostCreateInput; authorEmail: string }) => {
      return prismaClient.post.create({
        data: {
          title: args.data.title,
          content: args.data.content,
          author: {
            connect: { email: args.authorEmail },
          },
        },
      });
    },
    togglePublishPost: async (_root, args: { id: number }) => {
      try {
        const post = await prismaClient.post.findUnique({
          where: { id: args.id || undefined },
          select: {
            published: true,
          },
        });

        const updatedPost = await prismaClient.post.update({
          where: { id: args.id || undefined },
          data: { published: !post?.published },
        });

        return updatedPost;
      } catch (error) {
        throw new HttpError(400, `Post with ID ${args.id} does not exist in the database.`);
      }
    },
    deletePost: (_root, args: { id: number }) => {
      return prismaClient.post.delete({
        where: { id: args.id },
      });
    },
  },
  DateTime: DateTimeResolver,
  Post: {
    author: (root, _args) => {
      return prismaClient.post
        .findUnique({
          where: { id: root?.id },
        })
        .author();
    },
  },
};

export { typeDef, resolvers };
