// src/pages/Home.tsx
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore"; // 👈 Zustand 스토어 임포트
import { ModelSelection } from "../components/ModelSelection";
import { ClothingSelection } from "../components/ClothingSelection";
import { TryOnResult } from "../components/TryOnResult";
import {
  uploadPersonPhoto,
  uploadClothPhoto,
  requestTryon,
  getResultImageUrl,
  deletePhoto,
} from "../lib/api";

interface TryOnHistory {
  id: string;
  modelImage: string;
  clothingImage: string;
  resultImage: string;
  timestamp: Date;
}

interface UploadedItem {
  id: number;
  preview: string;
}

export default function Home() {
  const { token, userInfo } = useAuthStore(); // 👈 Zustand 스토어 사용
  const userId = userInfo?.id ?? null; // userInfo에서 id 추출

  const [modelImage, setModelImage] = useState<string | null>(null);
  const [clothingImage, setClothingImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const [uploadedModels, setUploadedModels] = useState<UploadedItem[]>([]);
  const [uploadedClothes, setUploadedClothes] = useState<UploadedItem[]>([]);

  const [tryOnHistory, setTryOnHistory] = useState<TryOnHistory[]>([]);
  
  const [personPhotoId, setPersonPhotoId] = useState<number | null>(null);
  const [clothPhotoId, setClothPhotoId] = useState<number | null>(null);

  const handleModelUpload = async (file: File, preview: string) => {
    if (!token) {
      alert("아직 백엔드에 로그인되지 않았어요.");
      return;
    }
    try {
      const uploaded = await uploadPersonPhoto(file, token);
      const newItem: UploadedItem = { id: uploaded.id, preview };
      setUploadedModels((prev) => [newItem, ...prev]);
      setModelImage(preview);
      setPersonPhotoId(uploaded.id);
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
      const newItem: UploadedItem = { id: uploaded.id, preview };
      setUploadedClothes((prev) => [newItem, ...prev]);
      setClothingImage(preview);
      setClothPhotoId(uploaded.id);
    } catch (e) {
      console.error(e);
      alert("옷 사진 업로드 실패: " + (e as Error).message);
    }
  };

  const handleSelectModel = (index: number) => {
    const item = uploadedModels[index];
    if (!item) return;
    setModelImage(item.preview);
    setPersonPhotoId(item.id);
  };

  const handleSelectClothing = (index: number) => {
    const item = uploadedClothes[index];
    if (!item) return;
    setClothingImage(item.preview);
    setClothPhotoId(item.id);
  };

  const handleSelectShopClothing = async (imageUrl: string) => {
    if (!token) {
      alert("로그인 후 이용해주세요.");
      return;
    }
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    const file = new File([blob], "shop-cloth.png", { type: blob.type });
    try {
      const uploaded = await uploadClothPhoto(file, token);
      setClothingImage(imageUrl);
      setClothPhotoId(uploaded.id);
    } catch (e) {
      console.error(e);
      alert("쇼핑몰 의류 등록 실패: " + (e as Error).message);
    }
  };

  const handleDeleteModel = async (index: number) => {
    const itemToDelete = uploadedModels[index];
    if (!itemToDelete || !token) return;
    try {
      await deletePhoto("person", itemToDelete.id, token);
      setUploadedModels((prev) => prev.filter((_, i) => i !== index));
      if (modelImage === itemToDelete.preview) {
        setModelImage(null);
        setPersonPhotoId(null);
      }
    } catch (e) {
      console.error("서버 사람 사진 삭제 실패:", e);
      alert("사진을 삭제할 권한이 없습니다. (관리자만 삭제 가능)");
    }
  };

  const handleDeleteClothing = async (index: number) => {
    const itemToDelete = uploadedClothes[index];
    if (!itemToDelete || !token) return;
    try {
      await deletePhoto("cloth", itemToDelete.id, token);
      setUploadedClothes((prev) => prev.filter((_, i) => i !== index));
      if (clothingImage === itemToDelete.preview) {
        setClothingImage(null);
        setClothPhotoId(null);
      }
    } catch (e) {
      console.error("서버 옷 사진 삭제 실패:", e);
      alert("사진을 삭제할 권한이 없습니다. (관리자만 삭제 가능)");
    }
  };

  const handleGenerateResult = () => {
    if (token && userId != null && personPhotoId != null && clothPhotoId != null) {
      (async () => {
        try {
          const res = await requestTryon(
            { user_id: userId, person_photo_id: personPhotoId, cloth_photo_id: clothPhotoId },
            token
          );
          const url = getResultImageUrl(res.result_filename);
          setResultImage(url);
          const newHistory: TryOnHistory = {
            id: Date.now().toString(),
            modelImage: modelImage!,
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
    } else {
      alert("사용자, 사람 사진, 옷 사진 정보가 부족해요.");
    }
  };

  const handleDeleteHistory = (id: string) => {
    setTryOnHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ModelSelection
              modelImage={modelImage}
              setModelImage={setModelImage}
              uploadedModels={uploadedModels}
              onModelUpload={handleModelUpload}
              onDeleteModel={handleDeleteModel}
              onSelectModel={handleSelectModel}
            />
            <ClothingSelection
              clothingImage={clothingImage}
              setClothingImage={setClothingImage}
              uploadedClothes={uploadedClothes}
              onClothingUpload={handleClothingUpload}
              onDeleteClothing={handleDeleteClothing}
              onSelectClothing={handleSelectClothing}
              onSelectShopClothing={handleSelectShopClothing}
            />
          </div>
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
