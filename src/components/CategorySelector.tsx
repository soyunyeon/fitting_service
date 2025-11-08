import { Shirt, Square, Crown, Watch } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface CategorySelectorProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export function CategorySelector({ selectedCategory, onCategorySelect }: CategorySelectorProps) {
  const categories = [
    {
      id: 'tops',
      name: '상의',
      icon: Shirt,
      count: 8
    },
    {
      id: 'bottoms',
      name: '하의',
      icon: Square,
      count: 6
    },
    {
      id: 'shoes',
      name: '신발',
      icon: Crown,
      count: 4
    },
    {
      id: 'accessories',
      name: '액세서리',
      icon: Watch,
      count: 5
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="mb-4">카테고리</h3>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => {
          const IconComponent = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant={isSelected ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => onCategorySelect(category.id)}
            >
              <IconComponent className="size-6" />
              <div className="text-center">
                <div className="font-medium">{category.name}</div>
                <div className="text-xs opacity-70">{category.count}개</div>
              </div>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}