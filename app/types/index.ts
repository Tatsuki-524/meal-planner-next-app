// ユーザー
export type User = {
  id: number;
  user_name: string;
  email: string;
  password: string;
  purpose: number;
  shopping_frequency_days: number;
  created_at: string;
  updated_at: string;
};

// 食材
export type Ingredient = {
  id: number;
  user_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  unit: string;
  category: number;
  expiration_date: string | null;
  created_at: string;
  updated_at: string;
};

// 献立の食材（AI提案）
export type MealItem = {
  name: string;
  quantity: number;
  unit: string;
};

// 献立の1食分（AI提案）
export type MealDetail = {
  name: string;
  ingredients: MealItem[];
  steps: string[];
};

// 献立（AI提案）
export type MealPlan = {
  breakfast: MealDetail;
  lunch: MealDetail;
  dinner: MealDetail;
  shopping_list: MealItem[];
};

// 献立の食材
export type MealPlanIngredient = {
  id: number;
  meal_plan_id: number;
  name: string;
  quantity: number;
  unit: string;
  created_at: string;
  updated_at: string;
};
