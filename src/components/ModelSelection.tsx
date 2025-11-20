import { useState } from 'react';
import { Upload, User, X } from 'lucide-react';
import { Button } from './ui/button';

interface ModelSelectionProps {
  modelImage: string | null;
  setModelImage: (image: string | null) => void;
  uploadedModels: string[];
  onModelUpload: (file: File, previewUrl: string) => void; // 🔴 수정
  onDeleteModel: (index: number) => void;
}


export function ModelSelection({ modelImage, setModelImage, uploadedModels, onModelUpload, onDeleteModel }: ModelSelectionProps) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        onModelUpload(file, preview);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
      <h2 className="text-xl mb-4">1. 모델 선택</h2>
      
      <div className="flex gap-4">
        {/* Upload Area */}
        <div className="flex-shrink-0">
          <div className="w-48 h-64 border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden">
            {modelImage ? (
              <img src={modelImage} alt="Selected model" className="w-full h-full object-cover" />
            ) : (
              <>
                <User className="w-16 h-16 text-gray-300 mb-4" />
              </>
            )}
          </div>
          <label htmlFor="model-upload">
            <div className="mt-3 cursor-pointer">
              <Button variant="outline" className="w-full" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  파일 선택
                </span>
              </Button>
            </div>
          </label>
          <input
            id="model-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Uploaded Models */}
        <div className="flex-1">
          <div className="mb-2">
            <span className="text-sm">업로드한 모델</span>
          </div>
          {uploadedModels.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-2">
              {uploadedModels.map((model, idx) => (
                <div
                  key={idx}
                  onClick={() => setModelImage(model)}
                  className={`aspect-[3/4] border-2 rounded cursor-pointer transition-all hover:border-blue-500 relative group ${
                    modelImage === model ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                  }`}
                >
                  <img src={model} alt={`Uploaded model ${idx + 1}`} className="w-full h-full object-cover rounded" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteModel(idx);
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
              <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">업로드한 모델 사진이</p>
              <p className="text-sm text-gray-500">여기에 표시됩니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}