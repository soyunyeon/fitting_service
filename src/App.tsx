// src/App.tsx
import { useState } from "react";
import { Header } from "./components/Header";
import { UserImageUpload } from "./components/UserImageUpload";
import { ClothingGrid } from "./components/ClothingGrid";
import { FittingPreview } from "./components/FittingPreview";
import { Toaster } from "./components/ui/sonner";
import { addToCart, tryOn } from "./lib/api";

interface ClothingItem {
  id: string;              // UI용 slug
  productId?: number;      // 테스트에선 안씀(고정 1로 보냄)
  name: string;
  category: string;
  imageUrl: string;
  price: string;
  brand: string;
}

export default function App() {
  const [userId, setUserId] = useState<string>("1"); // ★ user_id 항상 1 기본
  const [userImage, setUserImage] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<ClothingItem[]>([]);
  const [fittedItemIds, setFittedItemIds] = useState<Set<string>>(new Set());

  const handleImageSelect = (imageUrl: string) => setUserImage(imageUrl);

  // 장바구니 선택/해제 + 서버 동기화(추가 시만 호출)
  const handleItemSelect = async (item: ClothingItem) => {
    setCartItems(prev => {
      const exists = prev.some(v => v.id === item.id);
      if (exists) {
        setFittedItemIds(p => { const s = new Set(p); s.delete(item.id); return s; });
        return prev.filter(v => v.id !== item.id);
      } else {
        setFittedItemIds(p => new Set(p).add(item.id));
        return [...prev, item];
      }
    });

    try {
      // ★ product_id = 1 강제
      await addToCart(userId || "1", 1);
    } catch (e: any) {
      alert(`API(addToCart): ${e?.message ?? e}`);
    }
  };

  // 가상 피팅 토글 + 서버 tryon 호출
  const handleToggleFitting = async (itemId: string) => {
    setFittedItemIds(prev => {
      const s = new Set(prev);
      s.has(itemId) ? s.delete(itemId) : s.add(itemId);
      return s;
    });

    try {
      // ★ product_id = 1 강제
      await tryOn(userId || "1", 1);
    } catch (e: any) {
      alert(`API(tryOn): ${e?.message ?? e}`);
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    setFittedItemIds(prev => { const s = new Set(prev); s.delete(itemId); return s; });
  };

  const handleReset = () => {
    setCartItems([]);
    setFittedItemIds(new Set());
  };

  const fittedItems = cartItems.filter(item => fittedItemIds.has(item.id));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 좌측: 업로드 */}
          <div className="lg:col-span-1">
            <UserImageUpload
              onImageSelect={handleImageSelect}
              selectedImage={userImage}
              onUserId={(id) => setUserId(id || "1")}   // 업로드 응답에 user_id 있으면 갱신
            />
          </div>

          {/* 중앙: 아이템 그리드 */}
          <div className="lg:col-span-2">
            <ClothingGrid
              selectedItems={cartItems}
              onItemSelect={handleItemSelect}
            />
          </div>

          {/* 우측: 미리보기 */}
          <div className="lg:col-span-1">
            <FittingPreview
              userImage={userImage}
              cartItems={cartItems}
              fittedItems={fittedItems}
              fittedItemIds={fittedItemIds}
              onToggleFitting={handleToggleFitting}
              onRemoveFromCart={handleRemoveFromCart}
              onReset={handleReset}
              userId={userId} // 전달 (없어도 기본 1 쓰게 할 예정)
            />
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
