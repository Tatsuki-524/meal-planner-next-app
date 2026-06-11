export const CATEGORY_LIST = [
  { value: 0, label: "その他" },
  { value: 1, label: "肉" },
  { value: 2, label: "野菜" },
  { value: 3, label: "魚" },
  { value: 4, label: "主食" },
  { value: 5, label: "乳製品・卵" },
] as const; // カテゴリはこれだけを使用するため、as constでリテラル型に変換

// 配列の中の各要素から value だけ抜き出してそれを型にする
export type CategoryKey = (typeof CATEGORY_LIST)[number]["value"];
