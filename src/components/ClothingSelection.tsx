// src/components/ClothingSelection.tsx
import { useState } from "react";
import { Upload, Shirt, Store, X } from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import clothingImage1 from "figma:asset/ec478afec06191b2977f327968ed199408d44f63.png";
import clothingImage2 from "figma:asset/6ad04ccc7deac17b00da7fbc8a58809c89be3c76.png";
import clothingImage3 from "figma:asset/63adf4a627db81a79b1ab86c04939a51c413a6a9.png";
import clothingImage4 from "figma:asset/43a67d99ab47deecf1dc27c872d2cd85dd380886.png";
import clothingImage5 from "figma:asset/884d053c36061a0f37171a128e81b956b1c9d1f4.png";
import clothingImage6 from "figma:asset/80114a8eb1bcabdf0ab0d31d4e3ca107ee35b761.png";
import clothingImage7 from "figma:asset/613f3527ccbd7ed333879dcb09b10246a2ad7bb4.png";
import clothingImage8 from "figma:asset/2124db1344945b0e12af4fca5be4f71f97f29798.png";
import clothingImage9 from "figma:asset/ebbe1f21d3220ac41756975ddc57530257d5d3d5.png";

// App.tsx 의 UploadedItem 과 같은 구조
interface UploadedItem {
  id: number;      // 백엔드 photo_id
  preview: string; // 미리보기 URL
}

interface ClothingSelectionProps {
  clothingImage: string | null;
  setClothingImage: (image: string | null) => void;
  uploadedClothes: UploadedItem[];
  onClothingUpload: (file: File, previewUrl: string) => void;
  onDeleteClothing: (index: number) => void;
  onSelectClothing: (index: number) => void; // ✅ 추가
  onSelectShopClothing?: (imageUrl: string) => void;
}

export function ClothingSelection({
  clothingImage,
  setClothingImage,
  uploadedClothes,
  onClothingUpload,
  onDeleteClothing,
  onSelectClothing,
  onSelectShopClothing,
}: ClothingSelectionProps) {
  const [sampleClothes] = useState<string[]>([
    clothingImage1,
    clothingImage2,
    clothingImage3,
    clothingImage4,
    clothingImage5,
    clothingImage6,
    clothingImage7,
    clothingImage8,
    clothingImage9,
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        onClothingUpload(file, preview);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
      <h2 className="text-xl mb-4">2. 의류 선택</h2>

      <Tabs defaultValue="uploaded" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="uploaded" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            업로드한 사진
          </TabsTrigger>
          <TabsTrigger value="shop" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            쇼핑몰 연동 상품
          </TabsTrigger>
        </TabsList>

        {/* Uploaded Clothes Tab */}
        <TabsContent value="uploaded">
          <div className="flex gap-4">
            {/* Upload Area */}
            <div className="flex-shrink-0">
              <div className="w-48 h-64 border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden">
                {clothingImage ? (
                  <img
                    src={clothingImage}
                    alt="Selected clothing"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <Shirt className="w-16 h-16 text-gray-300 mb-4" />
                  </>
                )}
              </div>
              <label htmlFor="clothing-upload">
                <div className="mt-3 cursor-pointer">
                  <Button variant="outline" className="w-full" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      사진 업로드
                    </span>
                  </Button>
                </div>
              </label>
              <input
                id="clothing-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Uploaded Clothes List */}
            <div className="flex-1">
              <div className="mb-2">
                <span className="text-sm">업로드한 의류</span>
              </div>
              {uploadedClothes.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-2">
                  {uploadedClothes.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setClothingImage(item.preview);
                        onSelectClothing(idx); // ✅ 선택하면 App.tsx 쪽 clothPhotoId 도 변경
                      }}
                      className={`aspect-[3/4] border-2 rounded cursor-pointer transition-all hover:border-blue-500 relative group ${
                        clothingImage === item.preview
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-300"
                      }`}
                    >
                      <img
                        src={item.preview}
                        alt={`Uploaded clothing ${idx + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClothing(idx);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Shirt className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">업로드한 의류 사진이</p>
                  <p className="text-sm text-gray-500">여기에 표시됩니다</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Shop Products Tab */}
        <TabsContent value="shop">
          <div className="flex gap-4">
            {/* Preview Area */}
            <div className="flex-shrink-0">
              <div className="w-48 h-64 border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden">
                {clothingImage ? (
                  <img
                    src={clothingImage}
                    alt="Selected clothing"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <Store className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-sm text-gray-500 text-center px-4">
                      상품을 선택하세요
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Sample Clothes from Shop (프론트 데모용, 백엔드 id 없음) */}
            <div className="flex-1">
              <div className="mb-2">
                <span className="text-sm">쇼핑몰 상품</span>
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-2">
                {sampleClothes.map((clothing, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      // 1) 프론트에서 선택된 의류 이미지 상태 변경 (파란 테두리용)
                      setClothingImage(clothing);

                      // 2) 선택한 쇼핑몰 이미지를 서버에 업로드해서 cloth_photo_id 만들기
                      //    (App.tsx에서 넘겨준 handleSelectShopClothing 호출)
                      onSelectShopClothing?.(clothing);   // ❗ ?. 로 안전하게
                    }}
                    className={`aspect-[3/4] border-2 rounded cursor-pointer transition-all hover:border-blue-500 ${
                      clothingImage === clothing
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-300"
                    }`}
                  >
                    <img
                      src={clothing}
                      alt={`Shop item ${idx + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
