export const SHOPPING_FREQUENCY_LIST = [
  { value: 1, label: "毎日" },
  { value: 3, label: "3日に1回" },
  { value: 7, label: "1週間に1回" },
  { value: 14, label: "2週間に1回" },
  { value: 30, label: "月1回" },
] as const; // カテゴリはこれだけを使用するため、as constでリテラル型に変換

// 配列の中の各要素から value だけ抜き出してそれを型にする
export type ShoppingFrequencyKey =
  (typeof SHOPPING_FREQUENCY_LIST)[number]["value"];
