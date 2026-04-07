"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { deletePost, fetchPost, toggleLike } from "@/lib/api";
import { Post, PostListItem } from "@/types/post";

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const postId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [post, setPost] = useState<Post | PostListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!postId) {
      setError("게시글이 없습니다.");
      setLoading(false);
      return;
    }

    const loadPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPost(String(postId));

        if (!data) {
          setError("게시글이 없습니다.");
          setPost(null);
          return;
        }

        setPost(data);
      } catch {
        setError("게시글이 없습니다.");
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  const handleLike = async () => {
    if (!postId || isLiking || !post) {
      return;
    }

    try {
      setIsLiking(true);
      const updatedPost = await toggleLike(String(postId));
      setPost((prevPost) => {
        if (!prevPost) {
          return updatedPost;
        }

        return {
          ...updatedPost,
          likes: Math.max(updatedPost.likes, prevPost.likes + 1),
        };
      });
    } catch {
      alert("좋아요 처리에 실패했습니다.");
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!postId || isDeleting) {
      return;
    }

    const confirmed = confirm("정말 삭제하시겠습니까?");
    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      await deletePost(String(postId));
      router.push("/community");
    } catch {
      alert("삭제에 실패했습니다.");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <p style={{ marginBottom: "16px", color: "#d32f2f" }}>
          {error ?? "게시글이 없습니다."}
        </p>
        <button
          onClick={() => router.push("/community")}
          style={{
            padding: "8px 14px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            backgroundColor: "#fff",
            cursor: "pointer",
          }}
        >
          ← 목록으로
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button
          onClick={() => router.push("/community")}
          style={{
            padding: "8px 14px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            backgroundColor: "#fff",
            cursor: "pointer",
          }}
        >
          ← 목록으로
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          style={{
            padding: "8px 14px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: isDeleting ? "#ef9a9a" : "#d32f2f",
            color: "#fff",
            cursor: isDeleting ? "not-allowed" : "pointer",
          }}
        >
          {isDeleting ? "삭제 중..." : "삭제"}
        </button>
      </div>

      <h1 style={{ marginBottom: "12px" }}>{post.title}</h1>

      <div style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
        <span>작성자: {post.author}</span>
        <span style={{ marginLeft: "12px" }}>
          작성일: {new Date(post.createdAt).toLocaleString()}
        </span>
        <span style={{ marginLeft: "12px" }}>좋아요: {post.likes}</span>
        <span style={{ marginLeft: "12px" }}>
          댓글: {"commentCount" in post ? post.commentCount : post.comments.length}
        </span>
      </div>

      <button
        onClick={handleLike}
        disabled={isLiking}
        style={{
          marginBottom: "16px",
          padding: "10px 16px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: isLiking ? "#90caf9" : "#1976d2",
          color: "#fff",
          fontWeight: 600,
          cursor: isLiking ? "not-allowed" : "pointer",
        }}
      >
        {isLiking ? "처리 중..." : `좋아요 ${post.likes}`}
      </button>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "16px",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
        }}
      >
        {post.content}
      </div>
    </div>
  );
}