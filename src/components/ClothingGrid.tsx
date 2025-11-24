import { useMemo } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export interface ClothingItem {
  id: string;
  productId?: number;
  name: string;
  category: string;
  imageUrl: string;
  price: string;
  brand: string;
  selected?: boolean;
}

interface ClothingGridProps {
  selectedItems: ClothingItem[];
  onItemSelect: (item: ClothingItem) => void;
  customItems?: ClothingItem[];
}



export function ClothingGrid({ selectedItems, onItemSelect, customItems }: ClothingGridProps) {
  const defaultClothingItems: Record<string, ClothingItem[]> = {
    tops: [
      {
        id: 'navy-hoodie',
        name: '후드티 네이비',
        category: 'tops',
        imageUrl: '/images/products/남_후드티_네이비.png',
        price: '29,000원',
        brand: 'Basic'
      },
      {
        id: 'black-sweatshirt',
        name: '레터링 맨투맨 블랙',
        category: 'tops',
        imageUrl: '/images/products/레터링_맨투맨_블랙.png',
        price: '89,000원',
        brand: 'Basic'
      },
      {
        id: 'khaki-shirt',
        name: '셔츠 카키',
        category: 'tops',
        imageUrl: '/images/products/빈티지_셔츠_카키.png',
        price: '125,000원',
        brand: 'Casual'
      }
    ],
    bottoms: [
      {
        id: 'blue-jeans',
        name: '데님팬츠 블루',
        category: 'bottoms',
        imageUrl: '/images/products/데님팬츠_블루.png',
        price: '65,000원',
        brand: 'Denim Co.'
      },
      {
        id: 'beige-pants',
        name: '와이드핏 슬랙스 베이지',
        category: 'bottoms',
        imageUrl: '/images/products/와이드핏_슬렉스.png',
        price: '79,000원',
        brand: 'Office'
      },
      {
        id: 'brown-cottonpants',
        name: '코튼팬츠 브라운',
        category: 'bottoms',
        imageUrl: '/images/products/코튼팬츠_브라운.png',
        price: '79,000원',
        brand: 'Casual'
      }
    ],
    shoes: [
      {
        id: 'canvas-shoes',
        name: '캔버스',
        category: 'shoes',
        imageUrl: '/images/products/캔버스.png',
        price: '120,000원',
        brand: 'Casual'
      },
      {
        id: 'high-heels',
        name: '하이힐',
        category: 'shoes',
        imageUrl: 'https://images.unsplash.com/photo-1670607231621-c00fd76d2387?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoJTIwaGVlbHMlMjBzaG9lc3xlbnwxfHx8fDE3NTkwNzAxMjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        price: '150,000원',
        brand: 'Luxury'
      },
      {
        id: 'nike-sneakers',
        name: '나이키',
        category: 'shoes',
        imageUrl: '/images/products/나이키.png',
        price: '120,000원',
        brand: 'Sport'
      }
    ],
    accessories: [
      {
        id: 'handbag',
        name: '핸드백',
        category: 'accessories',
        imageUrl: 'https://images.unsplash.com/photo-1758171692659-024183c2c272?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwaGFuZGJhZ3xlbnwxfHx8fDE3NTkxMTk3NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        price: '180,000원',
        brand: 'Fashion'
      },
      {
        id: 'summer-hat',
        name: '여름 모자',
        category: 'accessories',
        imageUrl: 'https://images.unsplash.com/photo-1758900561440-4014bdd78c10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBoYXQlMjBhY2Nlc3Nvcmllc3xlbnwxfHx8fDE3NTkxMTk3ODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        price: '45,000원',
        brand: 'Summer'
      },
      {
        id: 'luxury-watch',
        name: '럭셔리 시계',
        category: 'accessories',
        imageUrl: 'https://images.unsplash.com/photo-1623052946389-f29990070f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3cmlzdCUyMHdhdGNoJTIwbHV4dXJ5fGVufDF8fHx8MTc1OTExOTc4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        price: '850,000원',
        brand: 'Luxury'
      }
    ]
  };

  const clothingItems = useMemo(() => {
    if (customItems && customItems.length > 0) {
      const grouped: Record<string, ClothingItem[]> = {
        tops: [],
        bottoms: [],
        shoes: [],
        accessories: []
      };
      customItems.forEach(item => {
        if (grouped[item.category]) {
          grouped[item.category].push(item);
        } else {
          if (Object.keys(grouped).includes(item.category)) {
             grouped[item.category].push(item);
          } else {
             grouped['tops'].push(item);
          }
        }
      });
      return grouped;
    }
    return defaultClothingItems;
  }, [customItems]);

  const selectedItemIds = selectedItems.map(item => item.id);

  const renderItems = (items: ClothingItem[]) => (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        const isSelected = selectedItemIds.includes(item.id);
        
        return (
          <Card
            key={item.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => onItemSelect(item)}
          >
            <div className="aspect-square overflow-hidden rounded-t-lg">
              <ImageWithFallback
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between mb-1">
                <h4 className="truncate">{item.name}</h4>
                {isSelected && (
                  <Badge className="ml-2">선택됨</Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-2">{item.brand}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3>쇼핑 아이템</h3>
        <Badge variant="secondary">{selectedItems.length}개 장바구니에 담김</Badge>
      </div>
      
      {renderItems(Object.values(clothingItems).flat())}
    </Card>
  );
}