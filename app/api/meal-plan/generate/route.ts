import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { Ingredient } from "@/app/types";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { ingredients }: { ingredients: Ingredient[] } = await req.json();

  const ingredientText = ingredients
    .map(
      (i) =>
        `・${i.name}（${i.quantity}${i.unit}、期限：${
          i.expiration_date ?? "なし"
        }）`
    )
    .join("\n");

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `以下の在庫食材を使って、今日の朝・昼・夜の献立を提案してください。
期限が近い食材を優先的に使ってください。
JSONのみ返してください。説明文やコードブロックは不要です。

以下のJSON形式で返してください：
{
  "breakfast": {
    "name": "料理名",
    "ingredients": [{ "name": "食材名", "quantity": 数量, "unit": "単位" }],
    "steps": ["手順1", "手順2", "手順3"]
  },
  "lunch": {
    "name": "料理名",
    "ingredients": [{ "name": "食材名", "quantity": 数量, "unit": "単位" }],
    "steps": ["手順1", "手順2", "手順3"]
  },
  "dinner": {
    "name": "料理名",
    "ingredients": [{ "name": "食材名", "quantity": 数量, "unit": "単位" }],
    "steps": ["手順1", "手順2", "手順3"]
  },
  "shopping_list": [{ "name": "食材名", "quantity": 数量, "unit": "単位" }]
}

shopping_listのルール：
・調味料（醤油・塩・砂糖・みりん・酒・油・バター・酢・味噌など）は含めない
・在庫にない食材は追加する
・在庫はあるが朝昼夜の合計必要量が在庫量より多い食材は、不足分の量を追加する

【在庫】
${ingredientText}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0].message.content ?? "";

  try {
    const plan = JSON.parse(text);
    return NextResponse.json(plan);
  } catch {
    console.log("パース失敗テキスト:", text);
    return NextResponse.json(
      { message: "AIの応答を解析できませんでした" },
      { status: 500 }
    );
  }
}
