"use client";

import { useRouter } from "next/navigation";
import { PostListItem } from "@/types/post";

interface PostCardProps {
  post: PostListItem;
}

export default function PostCard({ post }: PostCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/community/${post.id}`);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "12px",
        cursor: "pointer",
        backgroundColor: "#fff",
      }}
    >
      <h2 style={{ margin: "0 0 8px 0" }}>{post.title}</h2>

      <p style={{ margin: "0 0 8px 0", color: "#555" }}>{post.content}</p>

      <div style={{ fontSize: "14px", color: "#777" }}>
        <span>작성자: {post.author}</span>
        <span style={{ marginLeft: "12px" }}>좋아요: {post.likes}</span>
        <span style={{ marginLeft: "12px" }}>댓글: {post.commentCount}</span>
      </div>
    </div>
  );
}