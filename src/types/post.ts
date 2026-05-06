export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface PostListItem {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  commentCount: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  comments: Comment[];
}