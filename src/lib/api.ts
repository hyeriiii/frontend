import axios from "axios";
import { Post, PostListItem } from "@/types/post";
import { TokenResponse, User } from "@/types/auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_API_BASE_URL = "https://study-community-backend.vercel.app/api";

const toPostArray = (data: unknown): PostListItem[] => {
  if (Array.isArray(data)) {
    return data as PostListItem[];
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.posts)) {
      return record.posts as PostListItem[];
    }
    if (Array.isArray(record.data)) {
      return record.data as PostListItem[];
    }
  }

  return [];
};

export const fetchPosts = async () => {
  const res = await api.get("/posts");
  return toPostArray(res.data);
};

export const fetchPost = async (id: string) => {
  const normalizedId = String(id);
  const numericId = Number(id);

  try {
    const res = await api.get(`/posts/${normalizedId}`);
    if (res.data) {
      return res.data;
    }
  } catch {
    // Fall back to list lookup when single-post endpoint fails.
  }

  const res = await api.get("/posts");
  const posts = toPostArray(res.data);

  const post = posts.find((item) => {
    if (String(item.id) === normalizedId) {
      return true;
    }

    if (typeof item.id === "number" && !Number.isNaN(numericId)) {
      return item.id === numericId;
    }

    return false;
  });

  return post ?? null;
};

export const createPost = async (data: {
  title: string;
  content: string;
  author: string;
}) => {
  const res = await api.post("/posts", data);
  return res.data;
};

export const deletePost = async (id: string) => {
  const res = await api.delete(`/posts/${id}`);
  return res.data;
};

export const toggleLike = async (id: string) => {
  const res = await api.patch<Post>(`/posts/${id}/like`);
  return res.data;
};

export const createComment = async (
  postId: string,
  data: { author: string; content: string }
) => {
  const res = await api.post(`/posts/${postId}/comments`, data);
  return res.data;
};

export const deleteComment = async (commentId: string) => {
  const res = await api.delete(`/comments/${commentId}`);
  return res.data;
};

export const register = async (data: {
  username: string;
  email: string;
  password: string;
}): Promise<TokenResponse> => {
  const response = await fetch(`${AUTH_API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result?.message === "string"
        ? result.message
        : "회원가입에 실패했습니다."
    );
  }

  return result as TokenResponse;
};

export const login = async (data: {
  email: string;
  password: string;
}): Promise<TokenResponse> => {
  const response = await fetch(`${AUTH_API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result?.message === "string"
        ? result.message
        : "로그인에 실패했습니다."
    );
  }

  return result as TokenResponse;
};

export const getMe = async (token: string): Promise<User> => {
  const response = await fetch(`${AUTH_API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof result?.message === "string"
        ? result.message
        : "사용자 정보를 불러오지 못했습니다."
    );
  }

  return result as User;
};