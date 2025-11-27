// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ----- 타입들 -----
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserInfo {
  id: number;
  email?: string;
  username?: string;
  name?: string;
  google_id?: string;
  profile_image?: string;
  credits?: number; // Added for Zustand store
  // 백엔드에서 추가로 내려주면 알아서 붙음
  [key: string]: any;
}

export interface UploadResponse {
  id: number;
  filename: string;
  url?: string;
  [key: string]: any;
}

export interface ShopImageResponse {
  id: number;
  image_url: string;
  fitting_type: string;
  uploaded_at?: string | null;
  created_at?: string | null;
}

export interface TryonRequestPayload {
  user_id: number;
  person_photo_id: number;
  cloth_photo_id: number;
}

export interface TryonResponse {
  result_filename: string;
  result_url?: string; // Added result_url
  [key: string]: any;
}

// ----- 공통 에러 처리 -----
async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = JSON.stringify(data);
    } catch {
      // ignore
    }
    throw new Error(`API ${res.url} 실패: ${res.status} ${message}`);
  }
  return res.json() as Promise<T>;
}

// ----- (선택) 토큰 로그인: /auth/token -----
export async function login(
  username: string,
  password: string
): Promise<TokenResponse> {
  const body = new URLSearchParams();
  body.append("username", username);
  body.append("password", password);
  body.append("grant_type", "password");

  const res = await fetch(`${API_BASE_URL}/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  return handleJson<TokenResponse>(res);
}

// ----- 로그인한 유저 정보: /users/me -----
export async function getMe(token: string): Promise<UserInfo> {
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleJson<UserInfo>(res);
}

// ----- 사람 사진 업로드: /upload/person -----
export async function uploadPersonPhoto(
  file: File,
  token: string
): Promise<UploadResponse> {
  const formData = new FormData();

  // ⚠️ FastAPI 스키마에서 file 필드 이름이 "file" 이라서 반드시 이렇게 넣어줘야 함
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/upload/person`, {
    method: "POST",
    headers: {
      // ❗ 여기서 Content-Type 을 직접 설정하면 안 됨!
      // 브라우저가 boundary 포함해서 자동으로 넣어줘야 FastAPI가 제대로 읽음.
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return handleJson<UploadResponse>(res);
}

// ----- 사람 사진 목록 조회: /images/persons -----
export async function getUploadedPersonPhotos(
  token: string
): Promise<ShopImageResponse[]> {
  const res = await fetch(`${API_BASE_URL}/images/persons`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleJson<ShopImageResponse[]>(res);
}

// ----- 내 옷 사진 목록 조회: /images/my-clothes -----
export async function getUploadedClothPhotos(
  token: string
): Promise<ShopImageResponse[]> {
  const res = await fetch(`${API_BASE_URL}/images/my-clothes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleJson<ShopImageResponse[]>(res);
}

// ----- 옷 사진 업로드: /upload/cloth -----
export async function uploadClothPhoto(
  file: File,
  token: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file); // 여기서도 필드 이름은 "file"

  const res = await fetch(`${API_BASE_URL}/upload/cloth`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return handleJson<UploadResponse>(res);
}

// ------사진 삭제 ----------
export async function deletePhoto(
  category: "person" | "cloth",
  id: number,
  token: string
) {
  const res = await fetch(`${API_BASE_URL}/admin/photos/${category}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    let msg = `${res.status}`;
    try {
      const data = await res.json();
      msg += ` ${JSON.stringify(data)}`;
    } catch {
      // ignore
    }
    throw new Error(`사진 삭제 실패 (${category}/${id}): ${msg}`);
  }
}


// ----- 가상 시착 요청: /tryon -----
export async function requestTryon(
  payload: TryonRequestPayload,
  token: string
): Promise<TryonResponse> {
  const res = await fetch(`${API_BASE_URL}/tryon`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleJson<TryonResponse>(res);
}

// ----- 결과 이미지 URL 생성: /results/image/{filename} -----
export function getResultImageUrl(filename: string): string {
  return `${API_BASE_URL}/results/image/${encodeURIComponent(filename)}`;
}

export async function getShopClothes(): Promise<ShopImageResponse[]> {
  const res = await fetch(`${API_BASE_URL}/images/shop-clothes`);
  return handleJson<ShopImageResponse[]>(res);
}

// ----- 시착 결과 목록 조회: /results/{user_id} -----
export interface TryOnResultItem {
  id: number;
  user_id: number;
  person_photo_id?: number;
  cloth_photo_id?: number;
  image_url: string;
  created_at: string;
}

export async function getTryOnResults(
  userId: number,
  token: string
): Promise<TryOnResultItem[]> {
  const res = await fetch(`${API_BASE_URL}/results/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleJson<TryOnResultItem[]>(res);
}

