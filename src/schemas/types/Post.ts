import { gql } from 'apollo-server-koa';
import { DateTimeResolver } from 'graphql-scalars';

import HttpError from '../../utils/HttpError';

enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

interface PostOrderByUpdatedAtInput {
  updatedAt: SortOrder;
}

export interface PostCreateInput {
  title: string;
  content?: string;
}

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
    Posts: (_root, _args, context) => {
      return context.prisma.post.findMany();
    },
    allUsers: (_root, _args, context) => {
      return context.prisma.user.findMany();
    },
    postById: (_root, args: { id: number }, context) => {
      return context.prisma.post.findUnique({
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
      context,
    ) => {
      const or = args.searchString
        ? {
            OR: [
              { title: { contains: args.searchString } },
              { content: { contains: args.searchString } },
            ],
          }
        : {};

      return context.prisma.post.findMany({
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
    createDraft: (_root, args: { data: PostCreateInput; authorEmail: string }, context) => {
      return context.prisma.post.create({
        data: {
          title: args.data.title,
          content: args.data.content,
          author: {
            connect: { email: args.authorEmail },
          },
        },
      });
    },
    togglePublishPost: async (_root, args: { id: number }, context) => {
      try {
        const post = await context.prisma.post.findUnique({
          where: { id: args.id || undefined },
          select: {
            published: true,
          },
        });

        const updatedPost = await context.prisma.post.update({
          where: { id: args.id || undefined },
          data: { published: !post?.published },
        });

        return updatedPost;
      } catch (error) {
        throw new HttpError(400, `Post with ID ${args.id} does not exist in the database.`);
      }
    },
    deletePost: (_root, args: { id: number }, context) => {
      return context.prisma.post.delete({
        where: { id: args.id },
      });
    },
  },
  DateTime: DateTimeResolver,
  Post: {
    author: (root, _args, context) => {
      return context.prisma.post
        .findUnique({
          where: { id: root?.id },
        })
        .author();
    },
  },
};

export { typeDef, resolvers };
