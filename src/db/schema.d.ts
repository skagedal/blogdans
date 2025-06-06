/**
 * This file was generated by kysely-codegen.
 * Please do not edit it manually.
 */

import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface BlogdansUser {
  created_at: Generated<Timestamp | null>;
  email: string;
  id: string;
  name: string;
  photo: string;
  updated_at: Generated<Timestamp | null>;
}

export interface Comment {
  approved_at: Timestamp | null;
  author_id: string;
  content: string;
  created_at: Generated<Timestamp | null>;
  id: Generated<string>;
  post_id: string;
  updated_at: Generated<Timestamp | null>;
}

export interface GoogleUser {
  blog_user_id: string;
  created_at: Generated<Timestamp | null>;
  id: string;
  updated_at: Generated<Timestamp | null>;
}

export interface Post {
  created_at: Generated<Timestamp | null>;
  id: string;
  updated_at: Generated<Timestamp | null>;
}

export interface DB {
  blogdans_user: BlogdansUser;
  comment: Comment;
  google_user: GoogleUser;
  post: Post;
}
