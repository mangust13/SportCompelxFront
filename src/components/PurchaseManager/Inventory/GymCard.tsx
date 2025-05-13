// GymCard.tsx
import { useState } from 'react'

export interface ProductSummary {
  brandName: string
  productModel: string
  productType: string
  quantity: number
}

export interface GymInventory {
  gymNumber: number
  products: ProductSummary[]
}

type Props = {
  gym: GymInventory
}

export default function GymCard({ gym }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Зал {gym.gymNumber}</h3>
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="text-blue-600 hover:underline"
        >
          {expanded ? 'Приховати товари' : 'Переглянути товари'}
        </button>
      </div>
      {expanded && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {gym.products.map((p, idx) => (
            <div key={idx} className="bg-gray-50 p-3 rounded">
              <p className="text-sm">
                <span className="font-medium">Бренд:</span> {p.brandName}
              </p>
              <p className="text-sm">
                <span className="font-medium">Модель:</span> {p.productModel}
              </p>
              <p className="text-sm">
                <span className="font-medium">Тип:</span> {p.productType}
              </p>
              <p className="text-sm">
                <span className="font-medium">Кількість:</span> {p.quantity}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
