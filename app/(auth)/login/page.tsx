"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ログイン処理
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // フォームのデフォルトの送信を防止
    e.preventDefault();

    setLoading(true);

    // Authサインイン
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/ingredients");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Meal Planner</h1>
          <p className="mt-2 text-gray-500">食材管理アプリへようこそ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              メールアドレス
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full rounded-lg border border-gray-300 p-3"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">パスワード</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              className="w-full rounded-lg border border-gray-300 p-3"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white disabled:opacity-50"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <div className="mt-6 border-t pt-6 text-center">
          <p className="text-sm text-gray-500">アカウントをお持ちでない方</p>

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="mt-2 text-sm font-medium text-blue-600 hover:underline"
          >
            新規登録はこちら
          </button>
        </div>
      </div>
    </main>
  );
}
