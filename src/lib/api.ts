import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const toPostArray = (data: unknown): Array<{ id: string | number }> => {
  if (Array.isArray(data)) {
    return data as Array<{ id: string | number }>;
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.posts)) {
      return record.posts as Array<{ id: string | number }>;
    }
    if (Array.isArray(record.data)) {
      return record.data as Array<{ id: string | number }>;
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

  const post = posts.find((item: { id: string | number }) => {
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
  const res = await api.patch(`/posts/${id}/like`);
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