const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import { useState, useEffect } from "react";
import { ModelSelection } from "./components/ModelSelection";
import { ClothingSelection } from "./components/ClothingSelection";
import { TryOnResult } from "./components/TryOnResult";
import { User, Coins } from "lucide-react";
import {
  getMe,
  uploadPersonPhoto,
  uploadClothPhoto,
  requestTryon,
  getResultImageUrl,
} from "./lib/api";

interface TryOnHistory {
  id: string;
  modelImage: string;
  clothingImage: string;
  resultImage: string;
  timestamp: Date;
}

export default function App() {
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [clothingImage, setClothingImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [uploadedModels, setUploadedModels] = useState<string[]>([]);
  const [uploadedClothes, setUploadedClothes] = useState<string[]>([]);
  const [tryOnHistory, setTryOnHistory] = useState<TryOnHistory[]>([]);
  const [credits, setCredits] = useState<number>(50);

  // ⭐ API 관련 상태
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [personPhotoId, setPersonPhotoId] = useState<number | null>(null);
  const [clothPhotoId, setClothPhotoId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // 👉 구글 로그인 후 http://localhost:3000/#token=... 으로 돌아왔을 때 토큰 읽기
  useEffect(() => {
    const hash = window.location.hash; // 예: "#token=eyJhbGciOi..."

    if (!hash.startsWith("#token=")) {
      return; // 토큰이 없으면 아무것도 안 함
    }

    const tokenFromUrl = hash.replace("#token=", "");

    (async () => {
      try {
        // 1) 토큰 저장
        setToken(tokenFromUrl);

        // 2) /users/me 호출해서 로그인한 사용자 정보 가져오기
        const me = await getMe(tokenFromUrl);
        setUserId((me as any).id);

        const email =
          (me as any).email ??
          (me as any).username ??
          (me as any).name ??
          null;
        setUserEmail(email);

        // 3) 주소창에서 #token=... 제거
        window.history.replaceState({}, "", window.location.pathname);
      } catch (e) {
        console.error(e);
        alert(
          "로그인 후 사용자 정보를 불러오지 못했습니다: " +
            (e as Error).message
        );
      }
    })();
  }, []);

  const handleModelUpload = async (file: File, preview: string) => {
    if (!token) {
      alert("아직 백엔드에 로그인되지 않았어요.");
      return;
    }
    try {
      // 1) 백엔드에 사람 사진 업로드
      const uploaded = await uploadPersonPhoto(file, token);
      setPersonPhotoId(uploaded.id); // tryon에 쓸 id 저장

      // 2) 프론트엔드에는 미리보기 이미지 저장
      setUploadedModels((prev) => [preview, ...prev]);
      setModelImage(preview);
    } catch (e) {
      console.error(e);
      alert("사람 사진 업로드 실패: " + (e as Error).message);
    }
  };

  const handleClothingUpload = async (file: File, preview: string) => {
    if (!token) {
      alert("아직 백엔드에 로그인되지 않았어요.");
      return;
    }
    try {
      const uploaded = await uploadClothPhoto(file, token);
      setClothPhotoId(uploaded.id);

      setUploadedClothes((prev) => [preview, ...prev]);
      setClothingImage(preview);
    } catch (e) {
      console.error(e);
      alert("옷 사진 업로드 실패: " + (e as Error).message);
    }
  };

  const handleDeleteModel = (index: number) => {
    const modelToDelete = uploadedModels[index];
    setUploadedModels((prev) => prev.filter((_, i) => i !== index));

    // If the deleted model was selected, clear the selection
    if (modelImage === modelToDelete) {
      setModelImage(null);
    }
  };

  const handleDeleteClothing = (index: number) => {
    const clothingToDelete = uploadedClothes[index];
    setUploadedClothes((prev) => prev.filter((_, i) => i !== index));

    // If the deleted clothing was selected, clear the selection
    if (clothingImage === clothingToDelete) {
      setClothingImage(null);
    }
  };

  const handleGenerateResult = () => {
    if (!token || userId == null || personPhotoId == null || clothPhotoId == null) {
      alert("사용자, 사람 사진, 옷 사진 정보가 부족해요.");
      return;
    }

    // onGenerate 타입이 () => void 라서, 안쪽에서 비동기 IIFE 사용
    (async () => {
      try {
        const res = await requestTryon(
          {
            user_id: userId,
            person_photo_id: personPhotoId,
            cloth_photo_id: clothPhotoId,
          },
          token
        );

        // 결과 파일 이름으로 이미지 URL 생성
        const url = getResultImageUrl(res.result_filename);
        setResultImage(url);

        // 히스토리 추가 (프론트단에서만 관리)
        const newHistory: TryOnHistory = {
          id: Date.now().toString(),
          modelImage: modelImage!, // 이미 선택되어 있다고 가정
          clothingImage: clothingImage!,
          resultImage: url,
          timestamp: new Date(),
        };
        setTryOnHistory((prev) => [newHistory, ...prev]);
      } catch (e) {
        console.error(e);
        alert("가상 시착 요청 실패: " + (e as Error).message);
      }
    })();
  };

  const handleDeleteHistory = (id: string) => {
    setTryOnHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl">Virtual TryOn</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
              <Coins className="w-5 h-5 text-blue-600" />
              <span className="text-blue-900">크레딧: {credits}</span>
            </div>
            <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
              {!token ? (
                <>
                  {/* 로그인 안 된 상태 */}
                  <button
                    onClick={() => {
                      const redirectUri = window.location.origin; // 예: http://localhost:3000

                      window.location.href =
                        `${API_BASE_URL}/auth/google/login?redirect_uri=` +
                        encodeURIComponent(redirectUri);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Google 로그인
                  </button>
                </>
              ) : (
                <>
                  {/* 로그인 된 상태 */}
                  <span>{userEmail ?? "로그인됨"}</span>
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <User className="w-5 h-5" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <ModelSelection
              modelImage={modelImage}
              setModelImage={setModelImage}
              uploadedModels={uploadedModels}
              onModelUpload={handleModelUpload}
              onDeleteModel={handleDeleteModel}
            />
            <ClothingSelection
              clothingImage={clothingImage}
              setClothingImage={setClothingImage}
              uploadedClothes={uploadedClothes}
              onClothingUpload={handleClothingUpload}
              onDeleteClothing={handleDeleteClothing}
            />
          </div>

          {/* Right Column */}
          <div>
            <TryOnResult
              resultImage={resultImage}
              onGenerate={handleGenerateResult}
              hasRequiredImages={!!(modelImage && clothingImage)}
              history={tryOnHistory}
              onDeleteHistory={handleDeleteHistory}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
