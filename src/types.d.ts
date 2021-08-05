declare enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

interface PostOrderByUpdatedAtInput {
  updatedAt: SortOrder;
}

interface PostCreateInput {
  title: string;
  content?: string;
}

interface UserCreateInput {
  password: string;
  email: string;
  name?: string;
  posts?: PostCreateInput[];
}

interface UserUniqueInput {
  id?: number;
  email?: string;
}
