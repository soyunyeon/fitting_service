// src/lib/api.ts
// FastAPI 서버와 통신 전용 (user_id=1, product_id=1 고정 테스트용)

export const BASE = "http://first-pharmacies.gl.at.ply.gg:6644";

// ── 업로드 ──────────────────────────────────────────────────────────────
export async function uploadPerson(file: File) {
  const fd = new FormData();
  fd.append("file", file); // ★ 필드명 file 유지 (Swagger 기준)
  const res = await fetch(`${BASE}/upload/`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── 장바구니/결과 ───────────────────────────────────────────────────────
export async function getCart(userId = "1") {
  const res = await fetch(`${BASE}/cart/${userId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listResults(userId = "1") {
  const res = await fetch(`${BASE}/results/${userId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getResult(userId = "1", resultId: string | number) {
  const res = await fetch(`${BASE}/results/${userId}/${resultId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── 테스트 고정: product_id = 1 ─────────────────────────────────────────
// 어떤 아이템을 눌러도 항상 /add/1 /cart/1 으로 보냄
export async function addToCart(userId = "1", _ignored?: number) {
  const res = await fetch(`${BASE}/cart/${userId}/add/1`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => ({}));
}

export async function tryOn(userId = "1", _ignored?: number) {
  const res = await fetch(`${BASE}/tryon/${userId}/cart/1`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => ({}));
}
