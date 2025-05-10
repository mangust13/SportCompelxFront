import { useEffect, useState } from 'react'
import axios from 'axios'
import { ProductDto } from '../PurchaseDtos'
import ProductCard from './ProductCard'
import AddOrder from './AddOrder'
import Header from '../../../layout/Header'
import { ExportModal } from '../../ExportModal'
import { exportData } from '../../../utils/exportData'

export default function ProductList() {
  const [products, setProducts] = useState<ProductDto[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null)
  const [trigger, setTrigger] = useState(0)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const handleDeleteProduct = (productId: number) => {
    setProducts(prev => prev.filter(p => p.productId !== productId))
  }

  const filteredProducts = products.filter(prod =>
    prod.productModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.productType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.productDescription.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const fetchProducts = async () => {
    try {
      const res = await axios.get<ProductDto[]>('https://localhost:7270/api/Products/products-view')
      setProducts(res.data)
    } catch (err) {
      console.error('Помилка завантаження продуктів:', err)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [trigger])

  return (
    <div className={`flex flex-col gap-6 ${isFilterOpen ? 'w-[75%]' : 'w-[100%]'}`}>
      <Header
        title="Всього продуктів"
        total={products.length}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        triggerSearch={() => setTrigger(prev => prev + 1)}
        onExportClick={() => setIsExportModalOpen(true)}
      >
        {/* Тут можна додати фільтри, якщо треба */}
      </Header>

      <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 ${isFilterOpen ? 'xl:grid-cols-2' : 'xl:grid-cols-3'} items-start`}>
        {filteredProducts.map(prod => (
          <ProductCard
            key={prod.productId}
            product={prod}
            searchTerm={searchTerm}
            expandedCardId={expandedCardId}
            setExpandedCardId={setExpandedCardId}
            onDelete={handleDeleteProduct}
          />
        ))}
      </div>

      {/* {isAddingNew && (
        <AddOrder
          onClose={() => setIsAddingNew(false)}
          onSuccess={() => {
            fetchProducts()
            setIsAddingNew(false)
          }}
        />
      )} */}
    </div>
  )
}
