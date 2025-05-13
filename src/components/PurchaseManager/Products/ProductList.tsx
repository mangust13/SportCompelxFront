import { useEffect, useState } from 'react'
import axios from 'axios'
import { ProductDto } from '../PurchaseDtos'
import ProductCard from './ProductCard'
import BasketModal from './BasketModal'
import Header from '../../../layout/Header'
import { ExportModal } from '../../ExportModal'
import { exportData } from '../../../utils/exportData'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ProductList() {
  const [products, setProducts] = useState<ProductDto[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null)
  const [trigger, setTrigger] = useState(0)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isBasketModalOpen, setIsBasketModalOpen] = useState(false)

  

  const handleDeleteProduct = (productId: number) => {
    setProducts(prev => prev.filter(p => p.productId !== productId))
  }

  const filteredProducts = products.filter(prod =>
    prod.productModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.productType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.productDescription.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleExportFormat = (format: string) => {
    exportData(format, filteredProducts)
    setIsExportModalOpen(false)
  } 

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
      </Header>

    <button
      onClick={() => setIsBasketModalOpen(true)}
      className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 z-50">
      🧾 Оформити замовлення
    </button>


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

      {isBasketModalOpen && (
        <BasketModal
          onClose={() => setIsBasketModalOpen(false)}
          onConfirm={async () => {
            const basket = JSON.parse(localStorage.getItem('basket') || '[]')
            try {
              await axios.post('https://localhost:7270/api/Orders/create-from-basket', basket)
              localStorage.removeItem('basket')
              toast.success('Замовлення оформлено успішно!')
              setTrigger(prev => prev + 1)
              setIsBasketModalOpen(false)
            } catch (err) {
              toast.error('Помилка при оформленні замовлення')
            }
          }}
        />
      )}

      {isExportModalOpen && (
        <ExportModal
          onClose={() => setIsExportModalOpen(false)}
          onSelectFormat={handleExportFormat}
        />
      )}
    </div>
  )
}