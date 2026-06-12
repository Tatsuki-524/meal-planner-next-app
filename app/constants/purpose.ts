export const PURPOSE_LIST = [
  { value: 1, label: "健康" },
  { value: 2, label: "節約" },
  { value: 3, label: "ダイエット" },
  { value: 4, label: "筋トレ" },
] as const; // カテゴリはこれだけを使用するため、as constでリテラル型に変換

// 配列の中の各要素から value だけ抜き出してそれを型にする
export type PurposeKey = (typeof PURPOSE_LIST)[number]["value"];
