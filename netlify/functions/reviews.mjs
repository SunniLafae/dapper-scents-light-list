import { getStore } from "@netlify/blobs";

const store = getStore("dapper-scents-reviews");
const key = "published-reviews";

const baseReviews = [
  { name: "Marcus R.", rating: 5, product: "No.09 Couture", text: "The scent is smooth, elevated and fills the room without taking over. Exactly the energy I wanted.", date: "Community favorite" },
  { name: "Danielle P.", rating: 5, product: "Room Spray", text: "One spray changed the entire feel of my living room. It is grown, clean and unforgettable.", date: "Community favorite" },
  { name: "Tasha L.", rating: 5, product: "After Hours", text: "Beautiful presentation and an even better scent. Dapper Scents made my home feel intentional.", date: "Community favorite" }
];

async function getReviews() {
  return (await store.get(key, { type: "json" })) || baseReviews;
}

export default async (request) => {
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
  if (request.method === "GET") return new Response(JSON.stringify(await getReviews()), { headers });
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });

  try {
    const { name, product, rating, text } = await request.json();
    const cleanName = String(name || "").trim().slice(0, 60);
    const cleanProduct = String(product || "Dapper Scents product").trim().slice(0, 80);
    const cleanText = String(text || "").trim().slice(0, 500);
    const cleanRating = Math.min(5, Math.max(1, Number(rating) || 5));
    if (!cleanName || cleanText.length < 8) {
      return new Response(JSON.stringify({ error: "Please add your name and a review of at least 8 characters." }), { status: 400, headers });
    }
    const review = { name: cleanName, product: cleanProduct, rating: cleanRating, text: cleanText, date: "Just shared" };
    const reviews = await getReviews();
    await store.setJSON(key, [review, ...reviews]);
    return new Response(JSON.stringify(review), { status: 201, headers });
  } catch {
    return new Response(JSON.stringify({ error: "We could not save your review. Please try again." }), { status: 500, headers });
  }
};