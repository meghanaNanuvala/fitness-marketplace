// Reads the backend URL from marketplace-ui/.env
// VITE_API_URL=http://127.0.0.1:8000
// const API = import.meta.env.VITE_API_URL as string;

// function ok(res: Response) {
//   if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
//   return res.json();
// }

// const API = import.meta.env.VITE_API_URL as string;
const API = "http://127.0.0.1:8000";

function ok(res: Response) {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchAllListings() {
  return fetch(`${API}/api/v1/listings`).then(ok);
}

// ---------- Types ----------
export type Listing = {
  productId: string;
  productName: string;
  category: string;
  priceCents: number;
  qty: number;
  ownerUserId: string;
  isSeller: boolean;
  description?: string | null;
  photos?: string[] | null;   
};

export async function fetchSellerListings(ownerUserId: string) {
  return fetch(`${API}/api/v1/listings/owner/${ownerUserId}`).then(ok) as Promise<
    Listing[]
  >;
}


// ---------- Creates ----------
export async function createListing(input: {
  productId: string;
  productName: string;
  category: string;
  priceCents: number; // send cents
  qty: number;
  ownerUserId: string; // current seller id
  isSeller: boolean;   // usually true for sell flow
  description?: string;
  files?: File[];      // images (optional)
}) {
  const fd = new FormData();
  fd.append("productId", input.productId);
  fd.append("productName", input.productName);
  fd.append("category", input.category);
  fd.append("priceCents", String(input.priceCents));
  fd.append("qty", String(input.qty));
  fd.append("ownerUserId", input.ownerUserId);
  fd.append("isSeller", String(input.isSeller));
  if (input.description) fd.append("description", input.description);
  console.log("Creating listing with input:", input, `${API}/api/v1/listings`)
  for (const f of input.files ?? []) fd.append("photos", f);

  console.log("[createListing] posting to:", `${API}/api/v1/listings`);
  try {
    const res = await fetch(`${API}/api/v1/listings`, { method: "POST", body: fd });
    console.log("[createListing] response status:", res.status, res.statusText);
    const text = await res.text();
    // try parse JSON, else log text
    try {
      const json = JSON.parse(text);
      console.log("[createListing] response json:", json);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return json;
    } catch (e) {
      console.log("[createListing] response text:", text);
      if (!res.ok) throw new Error(`HTTP ${res.status} - non-json response`);
      // return text if OK
      return text;
    }
  } catch (err) {
    console.error("[createListing] fetch error:", err);
    throw err;
  }
  // return fetch(`${API}/api/v1/listings`, { method: "POST", body: fd }).then(ok) as Promise<
  //   Listing
  // >;
}

// ---------- Helpers ----------
export function photoUrl(pathOrUrl: string) {
  // Backend returns "/uploads/xxx.jpg". If it’s already absolute, just return it.
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return `${API}${pathOrUrl}`;
}

export async function fetchListingById(productId: string): Promise<Listing> {
  return fetch(`${API}/api/v1/listings/${productId}`).then(ok);
}


export async function addToCart(userId: string, productId: string, quantity = 1) {
  return fetch(`${API}/api/v1/cart/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity })
  }).then(ok);
}

export async function purchaseItem(userId: string, productId: string, quantity = 1) {
  return fetch(`${API}/api/v1/purchases/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity })
  }).then(ok);
}


export async function fetchCart(userId: string) {
  return fetch(`${API}/api/v1/cart/${userId}`).then(ok);
}

export async function removeCartItem(userId: string, productId: string) {
  return fetch(`${API}/api/v1/cart/${userId}/${productId}`, {
    method: "DELETE"
  }).then(ok);
}

export async function clearCart(userId: string) {
  return fetch(`${API}/api/v1/cart/${userId}`, {
    method: "DELETE"
  }).then(ok);
}

export async function purchaseAll(userId: string, items: any[]) {
  for (const it of items) {
    await fetch(`${API}/api/v1/purchases/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: it.productId,
        quantity: it.quantity,
      }),
    });
  }
}

export async function fetchPurchasedItems(userId: string) {
  return fetch(`${API}/api/v1/purchases/buyer/${userId}`).then(ok);
}

export async function submitReview(purchaseId: string, rating: number, comment: string) {
  return fetch(`${API}/reviews/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ purchase_id: purchaseId, rating, comment }),
  }).then(ok);
}


export async function fetchAverageRating(productId: string) {
  return fetch(`${API}/reviews/product/${productId}/average`).then(ok);
}

export async function fetchProductReviews(productId: string) {
  return fetch(`${API}/reviews/product/${productId}`).then(ok);
}







