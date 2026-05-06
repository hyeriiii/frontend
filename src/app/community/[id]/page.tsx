"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  createComment,
  deleteComment,
  deletePost,
  fetchPost,
  toggleLike,
} from "@/lib/api";
import CommentItem from "@/components/CommentItem";
import { Post, PostListItem } from "@/types/post";
import { useAuthStore } from "@/store/authStore";

export default function PostDetailPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const initialize = useAuthStore((state) => state.initialize);
  const params = useParams<{ id: string }>();
  const postId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [post, setPost] = useState<Post | PostListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

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
      setPost(updatedPost);
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

  const handleCreateComment = async () => {
    if (!postId || !post || isCommentSubmitting || !isLoggedIn) {
      return;
    }

    const trimmedContent = commentContent.trim();

    if (!trimmedContent) {
      return;
    }

    try {
      setIsCommentSubmitting(true);
      const newComment = await createComment(String(postId), {
        content: trimmedContent,
      });

      setPost((prevPost) => {
        if (!prevPost) {
          return prevPost;
        }

        if ("comments" in prevPost) {
          return {
            ...prevPost,
            comments: [...prevPost.comments, newComment],
          };
        }

        return {
          ...prevPost,
          commentCount: prevPost.commentCount + 1,
        };
      });
      setCommentContent("");
    } catch {
      alert("댓글 작성에 실패했습니다.");
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post || isCommentSubmitting || deletingCommentId || !isLoggedIn) {
      return;
    }

    const confirmed = confirm("정말 삭제하시겠습니까?");
    if (!confirmed) {
      return;
    }

    try {
      setDeletingCommentId(commentId);
      await deleteComment(commentId);

      setPost((prevPost) => {
        if (!prevPost) {
          return prevPost;
        }

        if ("comments" in prevPost) {
          return {
            ...prevPost,
            comments: prevPost.comments.filter((comment) => comment.id !== commentId),
          };
        }

        return {
          ...prevPost,
          commentCount: Math.max(prevPost.commentCount - 1, 0),
        };
      });
    } catch {
      alert("댓글 삭제에 실패했습니다.");
    } finally {
      setDeletingCommentId(null);
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="app-shell">
        <p style={{ marginBottom: "16px", color: "#444" }}>
          {error ?? "게시글이 없습니다."}
        </p>
        <button className="btn btn-muted" onClick={() => router.push("/community")}>
          ← 목록으로
        </button>
      </div>
    );
  }

  const comments = "comments" in post ? post.comments : [];
  const isCommentFormValid = commentContent.trim() !== "";
  const canDeletePost = isLoggedIn && post.author === user?.username;

  return (
    <div>
      <header className="app-header">
        <div className="app-header-inner">
          <div>
            <p className="brand-title">Five-set</p>
            <p className="brand-subtitle">게시글 상세</p>
          </div>
        </div>
      </header>
      <div className="app-shell">
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button className="btn btn-muted" onClick={() => router.push("/community")}>
          ← 목록으로
        </button>
        {canDeletePost ? (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn btn-danger"
            style={{ opacity: isDeleting ? 0.7 : 1, cursor: isDeleting ? "not-allowed" : "pointer" }}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </button>
        ) : null}
      </div>

      <div className="surface-card" style={{ padding: "20px", marginBottom: "16px" }}>
      <h1 style={{ marginTop: 0, marginBottom: "12px", color: "#222" }}>{post.title}</h1>

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
      </div>

      <button
        onClick={handleLike}
        disabled={isLiking}
        className="btn btn-primary"
        style={{ marginBottom: "16px", opacity: isLiking ? 0.7 : 1, cursor: isLiking ? "not-allowed" : "pointer" }}
      >
        {isLiking ? "처리 중..." : `좋아요 ${post.likes}`}
      </button>

      <div
        className="surface-card"
        style={{
          padding: "16px",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          marginBottom: "20px",
        }}
      >
        {post.content}
      </div>

      <div
        className="surface-card"
        style={{
          padding: "16px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "12px" }}>댓글 작성</h3>
        {isLoggedIn ? (
          <>
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="댓글 내용을 입력하세요"
              rows={4}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d0d0d0",
                borderRadius: "6px",
                marginBottom: "10px",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
            <button
              onClick={handleCreateComment}
              disabled={!isCommentFormValid || isCommentSubmitting}
              className="btn btn-primary"
              style={{ opacity: !isCommentFormValid || isCommentSubmitting ? 0.6 : 1, cursor: !isCommentFormValid || isCommentSubmitting ? "not-allowed" : "pointer" }}
            >
              {isCommentSubmitting ? "작성 중..." : "댓글 작성"}
            </button>
          </>
        ) : (
          <p style={{ margin: 0, color: "#666" }}>
            로그인 후 댓글을 작성할 수 있습니다.{" "}
            <Link href="/login" style={{ color: "#111", fontWeight: 600, textDecoration: "none" }}>
              로그인
            </Link>
          </p>
        )}
      </div>

      <div
        className="surface-card"
        style={{
          padding: "16px",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "12px" }}>
          댓글 {comments.length > 0 ? comments.length : ""}
        </h3>
        {comments.length === 0 ? (
          <p style={{ margin: 0, color: "#666" }}>아직 댓글이 없습니다.</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={
                isLoggedIn && comment.author === user?.username
                  ? handleDeleteComment
                  : undefined
              }
              isDeleting={deletingCommentId === comment.id}
            />
          ))
        )}
      </div>
      </div>
    </div>
  );
}