import { useState } from "react";
import { RotateCcw, X, ShoppingBag, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { addToCart, tryOn, listResults, getResult } from "@/lib/api"; // ✅ 서버 API 추가

interface ClothingItem {
  id: string;
  productId: number;
  name: string;
  category: string;
  imageUrl: string;
  price: string;
  brand: string;
}

interface FittingPreviewProps {
  userImage: string | null;
  cartItems: ClothingItem[];
  fittedItems: ClothingItem[];
  fittedItemIds: Set<string>;
  onToggleFitting: (itemId: string) => void;
  onRemoveFromCart: (itemId: string) => void;
  onReset: () => void;
  userId?: string; // ✅ 서버 user_id (업로드 후 받은 값)
}

const CATEGORY_LABELS: Record<string, string> = {
  tops: "상의",
  bottoms: "하의",
  shoes: "신발",
  accessories: "액세서리",
};

export function FittingPreview({
  userImage,
  cartItems,
  fittedItems,
  fittedItemIds,
  onToggleFitting,
  onRemoveFromCart,
  onReset,
  userId,
}: FittingPreviewProps) {
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  

  // ✅ Try-on 실행 함수
  async function runTryOnFlow(userId: string, productId: string) {
    try {
      setBusyItemId(productId);
      // 1) 장바구니에 추가
      await addToCart(userId, productId);
      // 2) Try-on 실행
      const res = await tryOn(userId, productId);
      const resultId = (res as any)?.result_id;
      console.log("tryon result_id:", resultId);

      // 3) 결과 이미지 기다리기
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const list: any = await listResults(userId);
        const latest = Array.isArray(list) ? list[0] : null;
        const candidateUrl =
          latest?.image_url || latest?.url || latest?.result_url || null;
        if (candidateUrl) {
          setResultImage(String(candidateUrl));
          return;
        }
        if (resultId) {
          const one: any = await getResult(userId, resultId);
          const url2 = one?.image_url || one?.url || one?.result_url || null;
          if (url2) {
            setResultImage(String(url2));
            return;
          }
        }
      }
      alert("결과 이미지를 가져오지 못했습니다.");
    } catch (err: any) {
      alert(err?.message ?? "Try-on 요청 실패");
      console.error(err);
    } finally {
      setBusyItemId(null);
    }
  }

  return (
    <Card className="p-6 sticky top-8 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3>가상 피팅</h3>
        {cartItems.length > 0 && (
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="size-4 mr-2" />
            전체 초기화
          </Button>
        )}
      </div>

      {/* 가상 피팅 미리보기 */}
      {userImage ? (
        <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden mb-4 flex-shrink-0">
          <ImageWithFallback
            src={userImage}
            alt="Fitting preview"
            className="w-full h-full object-cover"
          />

          {/* ✅ 서버 결과 이미지가 있으면 오버레이 */}
          {resultImage && (
            <img
              src={resultImage}
              alt="Try-on result"
              className="absolute inset-0 w-full h-full object-cover z-20"
            />
          )}

          {/* 착용 중인 아이템 */}
          {fittedItems.length > 0 && (
            <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-1 z-30">
              {fittedItems.map((item) => (
                <Badge
                  key={item.id}
                  variant="secondary"
                  className="text-xs backdrop-blur-sm bg-background/80"
                >
                  {item.name}
                </Badge>
              ))}
            </div>
          )}

          
        </div>
      ) : (
        <div className="aspect-[3/4] border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center mb-4 flex-shrink-0">
          <div className="text-center text-muted-foreground p-6">
            <p>모델 이미지를 선택하고</p>
            <p>아이템을 담아보세요</p>
          </div>
        </div>
      )}

      {/* 장바구니 */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="size-4" />
          <h4>장바구니 ({cartItems.length})</h4>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center text-muted-foreground p-6">
              <ShoppingBag className="size-12 mx-auto mb-3 opacity-20" />
              <p>장바구니가 비어있습니다</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-2 pb-4">
              {cartItems.map((item) => {
                const isFitted = fittedItemIds.has(item.id);

                return (
                  <Card
                    key={item.id}
                    className={`p-3 transition-all cursor-pointer ${
                      isFitted ? "ring-2 ring-primary bg-primary/5" : ""
                    }`}
                    onClick={async () => {
                      try {
                        const uid = userId || '1';                // ★ 기본 1
                        await runTryOnFlow(uid, item.id);
                        
                      } finally {
                        onToggleFitting(item.id);
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                        <ImageWithFallback
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h5 className="truncate text-sm">{item.name}</h5>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {busyItemId === item.id ? (
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                처리 중...
                              </Badge>
                            ) : isFitted ? (
                              <Badge variant="default" className="text-xs px-1.5 py-0">
                                <Eye className="size-3 mr-1" />
                                착용
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                <EyeOff className="size-3 mr-1" />
                                대기
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveFromCart(item.id);
                              }}
                            >
                              <X className="size-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {item.brand} · {CATEGORY_LABELS[item.category]}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </Card>
  );
}
