"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createComment, deletePost, fetchPost, toggleLike } from "@/lib/api";
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
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

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

  const handleCreateComment = async () => {
    if (!postId || !post || isCommentSubmitting) {
      return;
    }

    const trimmedAuthor = commentAuthor.trim();
    const trimmedContent = commentContent.trim();

    if (!trimmedAuthor || !trimmedContent) {
      return;
    }

    try {
      setIsCommentSubmitting(true);
      const newComment = await createComment(String(postId), {
        author: trimmedAuthor,
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

      setCommentAuthor("");
      setCommentContent("");
    } catch {
      alert("댓글 작성에 실패했습니다.");
    } finally {
      setIsCommentSubmitting(false);
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

  const comments = "comments" in post ? post.comments : [];
  const isCommentFormValid = commentAuthor.trim() !== "" && commentContent.trim() !== "";

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
          marginBottom: "20px",
        }}
      >
        {post.content}
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "12px" }}>댓글 작성</h3>
        <input
          type="text"
          value={commentAuthor}
          onChange={(e) => setCommentAuthor(e.target.value)}
          placeholder="작성자 이름"
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            marginBottom: "10px",
            boxSizing: "border-box",
          }}
        />
        <textarea
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder="댓글 내용을 입력하세요"
          rows={4}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            marginBottom: "10px",
            boxSizing: "border-box",
            resize: "vertical",
          }}
        />
        <button
          onClick={handleCreateComment}
          disabled={!isCommentFormValid || isCommentSubmitting}
          style={{
            padding: "8px 14px",
            border: "none",
            borderRadius: "6px",
            backgroundColor:
              !isCommentFormValid || isCommentSubmitting ? "#90caf9" : "#1976d2",
            color: "#fff",
            cursor:
              !isCommentFormValid || isCommentSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isCommentSubmitting ? "작성 중..." : "댓글 작성"}
        </button>
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
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
            <div
              key={comment.id}
              style={{
                borderTop: "1px solid #eee",
                paddingTop: "10px",
                marginTop: "10px",
              }}
            >
              <div style={{ fontSize: "14px", color: "#666", marginBottom: "6px" }}>
                {comment.author} · {new Date(comment.createdAt).toLocaleString()}
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{comment.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}