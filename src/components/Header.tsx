import { Shirt, Camera, Share2 } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shirt className="size-8 text-primary" />
          <h1>가상 피팅 서비스</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Camera className="size-4 mr-2" />
            사진 촬영
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="size-4 mr-2" />
            공유하기
          </Button>
        </div>
      </div>
    </header>
  );
}