"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

import { PURPOSE_LIST } from "@/app/constants/purpose";
import { SHOPPING_FREQUENCY_LIST } from "@/app/constants/shopping-frequencyDays";

export default function SignUpPage() {
  const router = useRouter();
  // ローディング状態を管理
  const [loading, setLoading] = useState(false);

  // 会員登録処理
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // フォームのデフォルトの送信を防止
    e.preventDefault();
    // フォームデータを取得
    const formData = new FormData(e.currentTarget);
    const userName: string = formData.get("userName") as string;
    const email: string = formData.get("email") as string;
    const password: string = formData.get("password") as string;
    const confirmPassword: string = formData.get("confirmPassword") as string;
    const purpose = Number(formData.get("purpose"));
    const shoppingFrequencyDays = Number(formData.get("shoppingFrequencyDays"));

    if (password !== confirmPassword) {
      alert("パスワードが一致しません");
      return;
    }

    setLoading(true);

    try {
      // Auth登録
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      const authUser = data.user;

      if (!authUser) {
        alert("ユーザー作成に失敗しました");
        return;
      }

      // usersテーブル登録
      const { error: userError } = await supabase.from("users").insert({
        id: authUser.id,
        user_name: userName,
        email,
        purpose,
        shopping_frequency_days: shoppingFrequencyDays,
      });

      if (userError) {
        alert(userError.message);
        return;
      }

      alert("会員登録が完了しました");

      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Meal Planner</h1>

          <p className="mt-2 text-gray-500">アカウントを作成してください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">ユーザー名</label>

            <input
              type="text"
              name="userName"
              required
              placeholder="hiroki"
              className="w-full rounded-lg border border-gray-300 p-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              メールアドレス
            </label>

            <input
              type="email"
              name="email"
              required
              placeholder="test@example.com"
              className="w-full rounded-lg border border-gray-300 p-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">パスワード</label>

            <input
              type="password"
              name="password"
              required
              minLength={6}
              placeholder="パスワード"
              className="w-full rounded-lg border border-gray-300 p-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              パスワード確認
            </label>

            <input
              type="password"
              name="confirmPassword"
              required
              minLength={6}
              placeholder="パスワードを再入力"
              className="w-full rounded-lg border border-gray-300 p-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">利用目的</label>

            <select
              name="purpose"
              className="w-full rounded-lg border border-gray-300 p-3"
              defaultValue={1}
            >
              {PURPOSE_LIST.map((purpose) => (
                <option key={purpose.value} value={purpose.value}>
                  {purpose.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">買い物頻度</label>

            <select
              name="shoppingFrequencyDays"
              className="w-full rounded-lg border border-gray-300 p-3"
              defaultValue={7}
            >
              {SHOPPING_FREQUENCY_LIST.map((frequency) => (
                <option key={frequency.value} value={frequency.value}>
                  {frequency.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "登録中..." : "アカウント作成"}
          </button>
        </form>

        <div className="mt-6 border-t pt-6 text-center">
          <p className="text-sm text-gray-500">
            すでにアカウントをお持ちですか？
          </p>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-2 text-sm font-medium text-blue-600 hover:underline"
          >
            ログインはこちら
          </button>
        </div>
      </div>
    </main>
  );
}
