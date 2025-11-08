// src/components/UserImageUpload.tsx
import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { uploadPerson } from "@/lib/api";

interface UserImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  selectedImage: string | null;
  onUserId?: (id: string) => void;  // ★ 추가: 업로드 응답 user_id를 부모로 전달
}

export function UserImageUpload({ onImageSelect, selectedImage, onUserId }: UserImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  const onPick = () => inputRef.current?.click();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";

    if (!file) return;

      // 1) 이미지 확장자/타입 가드
    if (!/^image\/(jpeg|png)$/i.test(file.type)) {
      alert("JPG 또는 PNG 파일을 선택해 주세요.");
      return;
    }

      // 2) 빈 파일 가드
    if (file.size === 0) {
      alert("파일 크기가 0입니다. 다른 파일로 시도해 주세요.");
      return;
    }
    
    // 화면 미리보기
    onImageSelect(URL.createObjectURL(file));

    setLoading(true);
    try {
      const res = await uploadPerson(file);   // { user_id: number, ... }
      if (res?.user_id) onUserId?.(String(res.user_id));
    } catch (err: any) {
      alert(`업로드 실패: ${err?.message ?? err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="mb-3 font-medium">모델 선택</div>
      <div className="aspect-[3/4] bg-muted rounded mb-3 overflow-hidden flex items-center justify-center">
        {selectedImage ? (
          <img src={selectedImage} alt="user" className="w-full h-full object-cover" />
        ) : (
          <span className="text-muted-foreground">이미지 미선택</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />
      <Button onClick={onPick} disabled={loading}>
        {loading ? "업로드 중..." : "새 사진 업로드"}
      </Button>
    </Card>
  );
}
