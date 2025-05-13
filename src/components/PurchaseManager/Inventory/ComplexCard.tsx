// ComplexCard.tsx
import { useState } from 'react'
import GymCard, { GymInventory } from './GymCard'

export interface ProductSummary {
  brandName: string
  productModel: string
  productType: string
  quantity: number
}

export interface ComplexInventory {
  complexAddress: string
  cityName: string
  gymCount: number
  gyms: GymInventory[]
}

type Props = {
  complex: ComplexInventory
}

export default function ComplexCard({ complex }: Props) {
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
          {expanded ? 'Приховати зали' : 'Переглянути зали'}
        </button>
      </div>
      {expanded && (
        <div className="mt-4 space-y-4">
          {complex.gyms.map(gym => (
            <GymCard key={gym.gymNumber} gym={gym} />
          ))}
        </div>
      )}
    </div>
  )
}
