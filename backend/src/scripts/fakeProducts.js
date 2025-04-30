import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "ADD URL HERE";
const supabaseKey = "ADD KEY HERE";

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_KEY in .env file under backend directory."
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedProducts() {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    const products = await response.json();

    const formatted = products.map((p) => ({
      title: p.title,
      body: p.description,
      price: p.price,
      image: p.image,
      user: 11,
    }));

    const { data, error } = await supabase
      .from("listings")
      .insert(formatted)
      .select();

    if (error) throw error;
    console.log(`Successfully inserted ${data.length} products.`);
  } catch (err) {
    console.error("Error seeding products:", err.message);
  }
}

seedProducts();
