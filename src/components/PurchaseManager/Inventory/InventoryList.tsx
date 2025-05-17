import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import Header from '../../../layout/Header'
import ComplexCard, { ComplexInventory } from './ComplexCard'
import { ProductDto } from '../PurchaseDtos'
import { ExportModal } from '../../ExportModal'
import { exportData } from '../../../utils/exportData'

export interface InventoryDto extends ProductDto {
  complexAddress: string
  cityName: string
  gymNumber: number
  quantity: number
}

export default function InventoryList() {
  const [inventory, setInventory] = useState<InventoryDto[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [trigger, setTrigger] = useState(0)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  

  useEffect(() => {
    axios
      .get<InventoryDto[]>('https://localhost:7270/api/inventory')
      .then(res => setInventory(res.data))
      .catch(err => console.error(err))
  }, [trigger])

  const complexes = useMemo<ComplexInventory[]>(() => {
    const map = new Map<string, {
      complexAddress: string
      cityName: string
      gyms: Map<number, InventoryDto[]>
    }>()
    inventory.forEach(item => {
      const key = `${item.complexAddress}__${item.cityName}`
      if (!map.has(key)) {
        map.set(key, {
          complexAddress: item.complexAddress,
          cityName: item.cityName,
          gyms: new Map()
        })
      }
      const complex = map.get(key)!
      const gymProducts = complex.gyms.get(item.gymNumber) || []
      gymProducts.push(item)
      complex.gyms.set(item.gymNumber, gymProducts)
    })

    return Array.from(map.values()).map(c => ({
      complexAddress: c.complexAddress,
      cityName: c.cityName,
      gymCount: c.gyms.size,
      gyms: Array.from(c.gyms.entries()).map(([gymNumber, items]) => ({
        gymNumber,
        products: items.map(i => ({
          brandName: i.brandName,
          productModel: i.productModel,
          productType: i.productTypeName,
          quantity: i.quantity
        }))
      }))
    }))
  }, [inventory])

  const handleExportFormat = (format: string) => {
      exportData(format, inventory)
      setIsExportModalOpen(false)
    }

  return (
    <div className="flex flex-col gap-6">
      <Header
        title=""
        total={inventory.length}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        triggerSearch={() => setTrigger(prev => prev + 1)}
        onExportClick={() => setIsExportModalOpen(true)}
      />
      <div className="grid gap-6">
        {complexes.map(c => (
          <ComplexCard key={`${c.complexAddress}-${c.cityName}`} complex={c} />
        ))}
      </div>
      {isExportModalOpen && (
        <ExportModal onClose={() => setIsExportModalOpen(false)} onSelectFormat={handleExportFormat} />
      )}
    </div>

  )
}
