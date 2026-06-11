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

// 献立
export type MealPlan = {
  id: number;
  user_id: number;
  title: string;
  meal_date: string;
  meal_type: number;
  created_at: string;
  updated_at: string;
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
