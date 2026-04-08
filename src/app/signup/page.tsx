"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { register } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface ValidationErrors {
  username?: string;
  email?: string;
  password?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): ValidationErrors => {
    const nextErrors: ValidationErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (username.trim().length < 2) {
      nextErrors.username = "username은 2자 이상 입력해주세요.";
    }
    if (!emailRegex.test(email.trim())) {
      nextErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }
    if (password.length < 6) {
      nextErrors.password = "password는 6자 이상 입력해주세요.";
    }

    return nextErrors;
  };

  const isFormValid = useMemo(() => {
    return (
      username.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
      password.length >= 6
    );
  }, [username, email, password]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }

    const nextErrors = validate();
    setErrors(nextErrors);
    setServerError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await register({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      setAuth(result.access_token, result.user);
      alert("회원가입 성공");
      router.push("/community");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "회원가입에 실패했습니다.";
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "380px",
          padding: "24px",
          border: "1px solid #d4d4d4",
          borderRadius: "12px",
          backgroundColor: "#fff",
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: "18px", fontSize: "24px" }}>
          회원가입
        </h1>

        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #cfcfcf",
            borderRadius: "8px",
            marginBottom: "8px",
            boxSizing: "border-box",
          }}
        />
        {errors.username ? (
          <p style={{ margin: "0 0 10px", color: "#444", fontSize: "14px" }}>
            {errors.username}
          </p>
        ) : null}

        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #cfcfcf",
            borderRadius: "8px",
            marginBottom: "8px",
            boxSizing: "border-box",
          }}
        />
        {errors.email ? (
          <p style={{ margin: "0 0 10px", color: "#444", fontSize: "14px" }}>
            {errors.email}
          </p>
        ) : null}

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #cfcfcf",
            borderRadius: "8px",
            marginBottom: "8px",
            boxSizing: "border-box",
          }}
        />
        {errors.password ? (
          <p style={{ margin: "0 0 10px", color: "#444", fontSize: "14px" }}>
            {errors.password}
          </p>
        ) : null}

        {serverError ? (
          <p style={{ margin: "0 0 12px", color: "#444", fontSize: "14px" }}>
            {serverError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          style={{
            width: "100%",
            padding: "10px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#111",
            color: "#fff",
            cursor:
              isSubmitting || !isFormValid ? "not-allowed" : "pointer",
            opacity: isSubmitting || !isFormValid ? 0.7 : 1,
          }}
        >
          {isSubmitting ? "가입 중..." : "회원가입"}
        </button>

        <p
          style={{
            margin: "12px 0 0",
            fontSize: "14px",
            color: "#555",
            textAlign: "center",
          }}
        >
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            style={{ color: "#111", fontWeight: 600, textDecoration: "none" }}
          >
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
}
