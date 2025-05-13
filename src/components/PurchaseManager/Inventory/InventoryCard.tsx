// InventoryCard.tsx
import { useState } from 'react'

export interface ComplexInventory {
  complexAddress: string
  cityName: string
  gymCount: number
  products: {
    productId: number
    brandName: string
    productModel: string
    productType: string
    quantity: number
  }[]
}

type Props = {
  complex: ComplexInventory
}

export default function InventoryCard({ complex }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">{complex.complexAddress}</h2>
          <p className="text-sm text-gray-600">{complex.cityName}</p>
          <p className="text-sm text-gray-500">Залів: {complex.gymCount}</p>
        </div>
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="text-blue-600 hover:underline"
        >
          {expanded ? 'Сховати товари' : 'Переглянути товари'}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {complex.products.map(p => (
            <div
              key={p.productId}
              className="border rounded-lg p-4 flex flex-col gap-1"
            >
              <p className="text-sm"><span className="font-medium">ID:</span> {p.productId}</p>
              <p className="text-sm"><span className="font-medium">Бренд:</span> {p.brandName}</p>
              <p className="text-sm"><span className="font-medium">Модель:</span> {p.productModel}</p>
              <p className="text-sm"><span className="font-medium">Тип:</span> {p.productType}</p>
              <p className="text-sm"><span className="font-medium">Кількість:</span> {p.quantity}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
