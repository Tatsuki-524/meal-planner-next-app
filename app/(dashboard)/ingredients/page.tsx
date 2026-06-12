"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Ingredient } from "@/app/types";
import { CATEGORY_LIST } from "@/app/constants/category";

export default function IngredientsPage() {
  // 食材在庫の状態管理
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  // フォームの送信状態管理
  const [loading, setLoading] = useState(false);
  // 編集状態管理
  const [editingId, setEditingId] = useState<number | null>(null);
  // 編集フォームの状態管理
  const [editForm, setEditForm] = useState<Partial<Ingredient>>({});

  // 食材データの取得
  const fetchIngredients = async () => {
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
      return;
    }

    setIngredients(data ?? []);
  };

  // 初回レンダリング時に食材データを取得
  useEffect(() => {
    fetchIngredients();
  }, []);

  // フォーム送信時の処理
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    // ページリロードの防止
    e.preventDefault();
    // フォームデータの取得
    const form = e.currentTarget;
    // FormData APIを使用してフォームの値を取得
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const quantity = Number(formData.get("quantity"));
    const unit_price = Number(formData.get("unit_price"));
    const unit = formData.get("unit") as string;
    const category = formData.get("category") as string;
    const expiration_date = formData.get("expiration_date") as string;
    setLoading(true);
    // ログインユーザー情報取得
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("ログインしてください");
      return;
    }

    const { error } = await supabase.from("ingredients").insert({
      user_id: user.id,
      name,
      quantity,
      unit,
      unit_price,
      category,
      expiration_date,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }
    // 送信後にフォームをリセットして、食材データを再取得
    form.reset();
    fetchIngredients();
  }

  // 削除処理
  async function handleDelete(id: number) {
    const ok = confirm("本当に削除しますか？");
    if (!ok) return;

    const { error } = await supabase.from("ingredients").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchIngredients();
  }

  // 編集開始
  function handleEdit(item: Ingredient) {
    setEditingId(item.id);
    setEditForm(item);
  }

  // 入力変更
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // 更新
  async function handleUpdate() {
    if (!editingId) return;

    const { error } = await supabase
      .from("ingredients")
      .update({
        name: editForm.name,
        quantity: Number(editForm.quantity),
        unit: editForm.unit,
        unit_price: Number(editForm.unit_price),
        category: editForm.category,
        expiration_date: editForm.expiration_date,
      })
      .eq("id", editingId);

    if (error) {
      alert(error.message);
      return;
    }

    setEditingId(null);
    setEditForm({});
    fetchIngredients();
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-3xl font-bold">在庫一覧</h1>

      {/* フォーム */}
      <div className="mb-6 rounded-lg border p-4">
        <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
          <input name="name" placeholder="食材名" className="w-40 border p-2" />

          <input
            name="quantity"
            placeholder="量"
            type="number"
            className="w-24 border p-2"
          />

          <input name="unit" placeholder="単位" className="w-14 border p-2" />

          <input
            name="unit_price"
            placeholder="単価"
            type="number"
            className="w-28 border p-2"
          />
          <p>円</p>

          <select name="category" className="w-30 border p-2">
            {CATEGORY_LIST.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          <input type="date" name="expiration_date" className="border p-2" />

          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "追加中..." : "追加"}
          </button>
        </form>
      </div>

      {/* 一覧 */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">食材名</th>
              <th className="p-3 text-left">数量</th>
              <th className="p-3 text-left">価格</th>
              <th className="p-3 text-left">カテゴリ</th>
              <th className="p-3 text-left">賞味期限</th>
              <th className="p-3 text-center">操作</th>
            </tr>
          </thead>

          <tbody>
            {ingredients.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  データがありません
                </td>
              </tr>
            ) : (
              ingredients.map((item) => {
                const isEditing = editingId === item.id;

                return (
                  <tr key={item.id} className="border-t">
                    {/* 食材名 */}
                    <td className="p-3">
                      {isEditing ? (
                        <input
                          name="name"
                          value={editForm.name ?? ""}
                          onChange={handleChange}
                          className="border p-1"
                        />
                      ) : (
                        item.name
                      )}
                    </td>

                    {/* 数量 */}
                    <td className="p-3">
                      {isEditing ? (
                        <input
                          name="quantity"
                          type="number"
                          value={editForm.quantity ?? 0}
                          onChange={handleChange}
                          className="border p-1 w-20"
                        />
                      ) : (
                        `${item.quantity}${item.unit}`
                      )}
                    </td>

                    {/* 価格 */}
                    <td className="p-3">
                      {isEditing ? (
                        <input
                          name="unit_price"
                          type="number"
                          value={editForm.unit_price ?? 0}
                          onChange={handleChange}
                          className="border p-1 w-24"
                        />
                      ) : (
                        `${item.unit_price}円`
                      )}
                    </td>

                    {/* カテゴリ */}
                    <td className="p-3">
                      {isEditing ? (
                        <select
                          name="category"
                          value={editForm.category ?? ""}
                          onChange={handleChange}
                          className="border p-1"
                        >
                          {CATEGORY_LIST.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        CATEGORY_LIST.find((c) => c.value === item.category)
                          ?.label ?? "不明"
                      )}
                    </td>

                    {/* 賞味期限 */}
                    <td className="p-3">
                      {isEditing ? (
                        <input
                          type="date"
                          name="expiration_date"
                          value={editForm.expiration_date ?? ""}
                          onChange={handleChange}
                          className="border p-1"
                        />
                      ) : (
                        item.expiration_date ?? "-"
                      )}
                    </td>

                    {/* 操作 */}
                    <td className="p-3 text-center">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleUpdate}
                            className="rounded bg-green-600 px-2 py-1 text-white"
                          >
                            保存
                          </button>

                          <button
                            onClick={() => setEditingId(null)}
                            className="ml-2 border px-2 py-1"
                          >
                            キャンセル
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(item)}
                            className="rounded border px-2 py-1 text-sm"
                          >
                            編集
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            className="ml-2 rounded border border-red-300 px-2 py-1 text-sm text-red-600"
                          >
                            削除
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
