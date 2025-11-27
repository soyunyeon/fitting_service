import { Sparkles, Share2, Download, History, Trash2, Loader2 } from 'lucide-react'; // Added Loader2
import { Button } from './ui/button';
import { toast } from 'sonner'; // Adjusted toast import based on common practice
import { Dialog, DialogContent, DialogTrigger, DialogFooter } from './ui/dialog';
import { useState } from 'react';

interface TryOnHistory {
  id: string;
  modelImage?: string;
  clothingImage?: string;
  resultImage: { filename: string; image_url: string };
  timestamp: Date;
}

interface TryOnResultProps {
  resultImage: { filename: string; image_url: string } | null;
  onGenerate: () => void;
  hasRequiredImages: boolean;
  history: TryOnHistory[];
  onDeleteHistory: (id: string) => void;
  isGenerating: boolean;
}

export function TryOnResult({ resultImage, onGenerate, hasRequiredImages, history, onDeleteHistory, isGenerating }: TryOnResultProps) {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('이미지 링크가 클립보드에 복사되었습니다!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('링크 복사에 실패했습니다.');
    }
  };

  const handleShare = () => {
    if (resultImage) {
      copyToClipboard(resultImage.image_url);
    } else {
      toast.error('공유할 이미지가 없습니다.');
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage.image_url;
      link.download = resultImage.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`'${resultImage.filename}' 이미지가 저장되었습니다!`);
    } else {
      toast.error('다운로드할 이미지가 없습니다.');
    }
  };

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-6 h-full">
      <h2 className="text-xl mb-4">3. 가상 시착 결과</h2>
      
      <div className="space-y-4">
        {/* Result Display Area */}
        {resultImage ? (
          <div className="flex justify-center items-center h-[400px] bg-gray-50 rounded-lg border-2 border-gray-300">
            <img 
              src={resultImage.image_url} 
              alt="Try-on result" 
              className="rounded-lg max-w-full max-h-full object-contain"
            />
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[400px] flex flex-col items-center justify-center bg-gray-50">
            <div className="text-center">
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">가상시착 결과가</p>
              <p className="text-gray-500">여기에 표시됩니다</p>
            </div>
          </div>
        )}
        
        {/* Generate Button */}
        <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
          <Button 
            onClick={onGenerate}
            disabled={!hasRequiredImages || isGenerating} // Disabled when generating
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                시착 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                가상 시착 진행하기
              </>
            )}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            onClick={handleShare}
            disabled={!resultImage}
          >
            <Share2 className="w-4 h-4 mr-2" />
            공유
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownload}
            disabled={!resultImage}
          >
            <Download className="w-4 h-4 mr-2" />
            저장
          </Button>
        </div>

        {/* History Section */}
        <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-5 h-5" />
            <h3>시착 기록</h3>
          </div>
          
          {history.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1">
              {history.map((item) => (
                <div 
                  key={item.id}
                  className="relative group aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 bg-white"
                >
                  <Dialog>
                    <DialogTrigger asChild>
                      <img 
                        src={item.resultImage.image_url} 
                        alt="Result" 
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <div className="relative aspect-[3/4] w-full bg-gray-50 rounded-lg overflow-hidden mb-2">
                        <img 
                          src={item.resultImage.image_url} 
                          alt="Result enlarged" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <DialogFooter className="sm:justify-between gap-2">
                        <Button 
                          className="flex-1"
                          variant="outline" 
                          onClick={() => {
                            copyToClipboard(item.resultImage.image_url);
                          }}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          공유
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = item.resultImage.image_url;
                            link.download = item.resultImage.filename;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            toast.success(`'${item.resultImage.filename}' 이미지가 저장되었습니다!`);
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          저장
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  {/* Delete Button Overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistory(item.id);
                    }}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p className="text-sm">아직 시착 기록이 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}