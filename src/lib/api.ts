import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchPosts = async () => {
  const res = await api.get("/posts");
  return res.data;
};

export const fetchPost = async (id: string) => {
  const res = await api.get(`/posts/${id}`);
  return res.data;
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