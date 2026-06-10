import { supabase } from "@/lib/supabase/client";

export default async function Home() {
  const { data, error } = await supabase.from("ingredients").select("*");

  return (
    <main>
      <h1>Meal Planner</h1>

      <h2>Error</h2>
      <pre>{JSON.stringify(error, null, 2)}</pre>

      <h2>Data</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
