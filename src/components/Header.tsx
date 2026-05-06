"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function Header() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const logout = useAuthStore((state) => state.logout);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        borderBottom: "1px solid #2a2a2a",
        backgroundColor: "#111",
      }}
    >
      <div
        style={{
          maxWidth: "920px",
          margin: "0 auto",
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#f5f5f5",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Five-set
          </Link>

          <Link
            href="/community"
            style={{
              color: "#d4d4d4",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            커뮤니티
          </Link>

          <Link
            href="/reservation"
            style={{
              color: "#d4d4d4",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            스터디룸 예약
          </Link>
        </div>

        {isLoggedIn && user ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                color: "#d4d4d4",
                fontSize: "14px",
              }}
            >
              {user.username}
            </span>

            <button
              onClick={handleLogout}
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                border: "1px solid #555",
                backgroundColor: "#1d1d1d",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              border: "1px solid #555",
              backgroundColor: "#1d1d1d",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            로그인
          </button>
        )}
      </div>
    </header>
  );
}