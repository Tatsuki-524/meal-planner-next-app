"use client";

import { supabase } from "@/lib/supabase/client";
import router from "next/router";
import { useEffect, useState } from "react";
import { MealPlan, Ingredient } from "./types";

export default function DashboardPage() {
  // 生成中かどうかの状態管理
  const [generating, setGenerating] = useState(false);
  // AIが提案した献立の状態管理
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  // 在庫データの状態管理
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  // ユーザーチェックの状態管理
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // ユーザーの在庫データをSupabaseから取得する関数
  const fetchIngredients = async (uid: string) => {
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (!error) setIngredients(data ?? []);
  };

  // 初回認証チェック
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);
      await fetchIngredients(user.id);
      setChecking(false);
    };

    checkUser();
  }, []);

  // AI献立生成
  async function handleGenerateMeal() {
    if (!userId) return;

    setGenerating(true);

    try {
      const res = await fetch("/api/meal-plan/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients }),
      });

      let data;

      try {
        data = await res.json();
      } catch {
        alert("レスポンスの解析に失敗しました");
        return;
      }

      if (!res.ok) {
        alert(data.message || "エラーが発生しました");
        return;
      }

      console.log("APIレスポンス:", data);
      setMealPlan(data);
    } finally {
      setGenerating(false);
    }
  }

  // 賞味期限確認関数
  function getExpirationColor(expiration_date: string | null): string {
    if (!expiration_date) return "";
    const today = new Date();
    const exp = new Date(expiration_date);
    const diffDays = Math.ceil(
      (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 2) return "text-red-500";
    if (diffDays <= 7) return "text-yellow-500";
    return "";
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-2">
      {/* ヘッダー */}
      <section className="space-y-1">
        <p className="text-gray-500">今日の食事と在庫をチェックしましょう</p>
      </section>

      {/* 買い物リスト */}
      <h2 className="text-lg font-bold">🛒 買い物リスト</h2>
      <section className="rounded-xl border p-3">
        <ul className="grid grid-cols-4 gap-2 text-sm">
          {mealPlan ? (
            mealPlan.shopping_list.length === 0 ? (
              <li className="text-gray-400 col-span-4">
                買い物は必要ありません
              </li>
            ) : (
              mealPlan.shopping_list.map((item, i) => (
                <li key={i}>
                  ・{item.name}{" "}
                  <span>
                    {item.quantity}
                    {item.unit}
                  </span>
                </li>
              ))
            )
          ) : (
            <li className="text-gray-400 col-span-4">
              AI献立生成後に表示されます
            </li>
          )}
        </ul>
      </section>

      {/* 在庫 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">🥦 在庫状況</h2>
        <button className="rounded bg-green-600 px-3 py-2 text-white text-sm">
          在庫管理へ
        </button>
      </div>
      <section className="rounded-xl border p-3">
        <ul className="grid grid-cols-4 gap-2 text-sm">
          {ingredients.length === 0 ? (
            <li className="text-gray-400 col-span-4">在庫データがありません</li>
          ) : (
            ingredients.map((item) => {
              const color = getExpirationColor(item.expiration_date);
              return (
                <li key={item.id} className={color}>
                  ・{item.name}（{item.quantity}
                  {item.unit}）
                </li>
              );
            })
          )}
        </ul>
      </section>

      {/* 献立 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">🍳 今日の献立（AI提案）</h2>
        <button className="rounded bg-green-600 px-3 py-2 text-white text-sm">
          献立表へ
        </button>
      </div>
      {mealPlan ? (
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { label: "朝", meal: mealPlan.breakfast },
              { label: "昼", meal: mealPlan.lunch },
              { label: "夜", meal: mealPlan.dinner },
            ] as const
          ).map(({ label, meal }) => (
            <section
              key={label}
              className="rounded-xl border p-4 space-y-2 text-sm"
            >
              <p className="font-bold border-b pb-1">
                {label}：{meal.name}
              </p>
              <div>
                <p className="text-gray-500 text-xs mb-1">【食材】</p>
                <ul className="space-y-0.5">
                  {meal.ingredients.map((ing, i) => (
                    <li key={i}>
                      ・{ing.name} {ing.quantity}
                      {ing.unit}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">【手順】</p>
                <ol className="space-y-0.5 list-decimal list-inside">
                  {meal.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="rounded-xl border p-5">
          <p className="text-sm text-gray-400">
            AI献立生成ボタンを押してください
          </p>
        </section>
      )}

      {/* クイックアクション */}
      <section className="flex flex-wrap gap-3">
        <button className="rounded border px-4 py-2 text-sm">
          ＋ 食材追加
        </button>
        <button className="rounded border px-4 py-2 text-sm">
          ＋ 買い物追加
        </button>
        <button
          onClick={handleGenerateMeal}
          className="rounded border px-4 py-2 text-sm"
          disabled={generating}
        >
          {generating ? "生成中..." : "🤖 AI献立生成"}
        </button>
      </section>
    </main>
  );
}
