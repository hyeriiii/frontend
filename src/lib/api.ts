import axios from "axios";
import { Post, PostListItem } from "@/types/post";
import { TokenResponse, User } from "@/types/auth";
import {
  Room,
  Reservation,
  ReservationCreate,
} from "@/types/reservation";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_API_BASE_URL = "https://study-community-backend.vercel.app/api";

const authApi = axios.create({
  baseURL: AUTH_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

authApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

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
    // fallback
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
  data: { content: string }
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
  try {
    const response = await authApi.post<TokenResponse>(
      "/auth/register",
      JSON.parse(JSON.stringify(data))
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "회원가입에 실패했습니다."
      );
    }

    throw new Error("회원가입에 실패했습니다.");
  }
};

export const login = async (data: {
  email: string;
  password: string;
}): Promise<TokenResponse> => {
  try {
    const response = await authApi.post<TokenResponse>(
      "/auth/login",
      JSON.parse(JSON.stringify(data))
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "로그인에 실패했습니다."
      );
    }

    throw new Error("로그인에 실패했습니다.");
  }
};

export const getMe = async (): Promise<User> => {
  try {
    const response = await authApi.get<User>("/auth/me");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "사용자 정보를 불러오지 못했습니다."
      );
    }

    throw new Error("사용자 정보를 불러오지 못했습니다.");
  }
};

// ===== 스터디룸 API =====

export const fetchRooms = async (): Promise<Room[]> => {
  const res = await api.get<Room[]>("/rooms");
  return res.data;
};

export const fetchRoom = async (
  roomId: string
): Promise<Room> => {
  const res = await api.get<Room>(`/rooms/${roomId}`);
  return res.data;
};

export const fetchRoomReservations = async (
  roomId: string,
  date: string
): Promise<Reservation[]> => {
  const res = await api.get<Reservation[]>(
    `/rooms/${roomId}/reservations?date=${date}`
  );

  return res.data;
};

// ===== 예약 API =====

export const createReservation = async (
  data: ReservationCreate
): Promise<Reservation> => {
  const res = await api.post<Reservation>(
    "/reservations",
    data
  );

  return res.data;
};

export const fetchMyReservations = async (): Promise<
  Reservation[]
> => {
  const res = await api.get<Reservation[]>(
    "/reservations/me"
  );

  return res.data;
};

export const cancelReservation = async (
  reservationId: string
): Promise<void> => {
  await api.delete(`/reservations/${reservationId}`);
};