import { Sparkles, Share2, Download, History, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { useState } from 'react';

interface TryOnHistory {
  id: string;
  modelImage: string;
  clothingImage: string;
  resultImage: { filename: string; url: string };
  timestamp: Date;
}

interface TryOnResultProps {
  resultImage: { filename: string; url: string } | null;
  onGenerate: () => void;
  hasRequiredImages: boolean;
  history: TryOnHistory[];
  onDeleteHistory: (id: string) => void;
}

export function TryOnResult({ resultImage, onGenerate, hasRequiredImages, history, onDeleteHistory }: TryOnResultProps) {
  const handleShare = () => {
    toast.success('공유 링크가 복사되었습니다!');
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage.url;
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
          <div className="flex justify-center">
            <img 
              src={resultImage.url} 
              alt="Try-on result" 
              className="rounded-lg"
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
            disabled={!hasRequiredImages}
            className="w-full"
            size="lg"
          >
            가상 시착 진행하기
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
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {history.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-3 justify-center items-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="w-16 h-20 flex-shrink-0 border border-gray-200 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                          <img 
                          src={item.resultImage.url} 
                            alt="Result" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <img 
                          src={item.resultImage.url} 
                          alt="Result enlarged" 
                          className="w-full h-auto object-contain max-h-[80vh]"
                        />
                      </DialogContent>
                    </Dialog>
                    <div className="flex-1 flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteHistory(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
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