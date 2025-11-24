import React, {useEffect, useState, useMemo, use} from 'react';
import { ClothingGrid, ClothingItem } from '../components/ClothingGrid';
import { useAuthStore } from '../store/useAuthStore';
import { 
  getShopClothes, 
  getShopClothImageUrl, 
  requestTryon, 
  getResultImageUrl, 
  uploadPersonPhoto,
  uploadClothPhoto
} from '../lib/api';
import { Button } from '../components/ui/button';
import { Upload, User, Sparkles, Loader2, Shirt } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/dialog';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function Shop() {
  const { token, userInfo } = useAuthStore();
  const userId = userInfo?.id ?? null;

  // --- State ---
  const [shopItems, setShopItems] = useState<ClothingItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  // Selection & TryOn State
  const [selectedClothing, setSelectedClothing] = useState<ClothingItem | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [personPhotoId, setPersonPhotoId] = useState<number | null>(null);
  const [clothPhotoId, setClothPhotoId] = useState<number | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  // --- Fetch Shop Items ---
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const shopImages = await getShopClothes();
        
        const items: ClothingItem[] = shopImages.map((image) => {
          const filename = image.filename;
          const lower = filename.toLowerCase();
          let category = 'tops';
          if (lower.includes('pant') || lower.includes('jean') || lower.includes('skirt') || lower.includes('bottom') || lower.includes('trouser')) category = 'bottoms';
          else if (lower.includes('shoe') || lower.includes('sneaker') || lower.includes('boot')) category = 'shoes';
          else if (lower.includes('bag') || lower.includes('hat') || lower.includes('cap') || lower.includes('access')) category = 'accessories';

          return {
            id: image.id.toString(),
            name: filename.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
            category,
            imageUrl: getShopClothImageUrl(filename),
            price: '가격 미정',
            brand: 'Shop Item',
          };
        });
        setShopItems(items);
      } catch (e) {
        console.error("Failed to fetch shop clothes:", e);
        toast.error("쇼핑몰 옷 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoadingItems(false);
      }
    };

    fetchItems();
  }, []);

  // --- Handlers ---

  // 1. Select Clothing from Grid
  const handleSelectClothing = async (item: ClothingItem) => {
    setSelectedClothing(item);
    setClothPhotoId(null); // Reset clothPhotoId, it will be uploaded during generation
    toast.success("옷이 선택되었습니다.");
  };

  // 2. Upload Model
  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    try {
      const reader = new FileReader();
      reader.onloadend = () => setModelImage(reader.result as string);
      reader.readAsDataURL(file);

      const uploaded = await uploadPersonPhoto(file, token);
      setPersonPhotoId(uploaded.id);
      toast.success("모델 사진이 등록되었습니다.");
    } catch (e) {
      console.error(e);
      toast.error("모델 업로드 실패: " + (e as Error).message);
    }
  };

  // 3. Generate Try-On
  const handleGenerate = async () => {
    if (!token) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    if (!userId || !personPhotoId || !selectedClothing) {
      toast.error("모델과 옷을 모두 선택해주세요.");
      return;
    }

    setIsGenerating(true);
    try {
      // Use the existing shop item ID directly instead of uploading
      // Assuming the shop item ID is valid for the try-on API
      const currentClothPhotoId = Number(selectedClothing.id);

      if (!currentClothPhotoId || isNaN(currentClothPhotoId)) {
        toast.error("유효하지 않은 옷 ID입니다.");
        setIsGenerating(false);
        return;
      }

      console.log("Requesting tryon with:", {
        user_id: userId,
        person_photo_id: personPhotoId,
        cloth_photo_id: currentClothPhotoId
      });

      const res = await requestTryon({
        user_id: userId,
        person_photo_id: personPhotoId,
        cloth_photo_id: currentClothPhotoId
      }, token);

      const url = getResultImageUrl(res.result_filename);
      setResultImage(url);
      toast.success("가상 시착 완료!");
    } catch (e) {
      console.error(e);
      toast.dismiss();
      toast.error("시착 생성 실패: " + (e as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="pt-20 max-w-7xl mx-auto px-6 py-8 min-h-screen bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- Left Column: Shop Items (8 cols) --- */}
        <div className="lg:col-span-8 space-y-6">
          

          {isLoadingItems ? (
            <div className="flex items-center justify-center h-[400px] bg-white rounded-lg border">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-500">상품을 불러오는 중...</span>
            </div>
          ) : (
            <ClothingGrid 
              customItems={shopItems} 
              selectedItems={selectedClothing ? [selectedClothing] : []}
              onItemSelect={handleSelectClothing}
            />
          )}
        </div>

        {/* --- Right Column: Compact TryOn (4 cols) --- */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <Card className="p-5 border-2 border-primary/10 shadow-lg bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-primary" />
                  미니 가상 시착
                </h3>
                <Badge variant={token ? "outline" : "destructive"}>
                  {token ? "준비됨" : "로그인 필요"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* 1. Model Selection */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 text-center">내 모델</p>
                  <div className="relative aspect-[3/4] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden group hover:border-primary transition-colors">
                    {modelImage ? (
                      <img src={modelImage} alt="Model" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                    <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                      <input type="file" accept="image/*" className="hidden" onChange={handleModelUpload} />
                      {!modelImage && <span className="mt-8 text-xs text-gray-500">업로드</span>}
                    </label>
                  </div>
                </div>

                {/* 2. Cloth Preview */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 text-center">선택한 옷</p>
                  <div className="aspect-[3/4] bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                    {selectedClothing ? (
                      <img src={selectedClothing.imageUrl} alt="Selected Cloth" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2">
                        <Shirt className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                        <span className="text-[10px] text-gray-400">목록에서 선택</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                className="w-full mb-4" 
                size="lg" 
                onClick={handleGenerate}
                // disabled={isGenerating || !modelImage || !selectedClothing || !token}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    시착 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    가상 시착 실행
                  </>
                )}
              </Button>

              {/* Result Display */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-medium text-gray-500 mb-2 text-center">시착 결과</p>
                <div className="w-1/2 mx-auto">
                  {resultImage ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="aspect-[3/4] rounded-lg overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity relative group">
                          <img src={resultImage} alt="Result" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity text-white text-xs font-medium">
                            확대하기
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg p-0 overflow-hidden bg-transparent border-none shadow-none">
                        <img src={resultImage} alt="Result Full" className="w-full h-auto rounded-lg" />
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="aspect-[3/4] bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                      <p className="text-gray-400 text-sm text-center px-2">시착 결과가 여기에 표시됩니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
