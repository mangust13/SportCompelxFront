// ProductList.tsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import Header from '../../../layout/Header'
import ProductCard from './ProductCard'
import BasketModal from './BasketModal'
import { ExportModal } from '../../ExportModal'
import { exportData } from '../../../utils/exportData'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ProductDto, BrandDto, ProductTypeDto} from '../PurchaseDtos'
import AddProduct from './AddProduct'

export default function ProductList() {
  const [products, setProducts] = useState<ProductDto[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null)

  const [availableBrands, setAvailableBrands] = useState<BrandDto[]>([])
  const [availableTypes, setAvailableTypes] = useState<ProductTypeDto[]>([])
  const [brandFilter, setBrandFilter] = useState<number>(0)
  const [typeFilter, setTypeFilter] = useState<number>(0)

  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isBasketModalOpen, setIsBasketModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    axios.get<BrandDto[]>('https://localhost:7270/api/Products/all-brands')
      .then(res => setAvailableBrands(res.data))
    axios.get<ProductTypeDto[]>('https://localhost:7270/api/Products/all-types')
      .then(res => setAvailableTypes(res.data))
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await axios.get<ProductDto[]>(
        'https://localhost:7270/api/Products/products-view',
        {
          params: {
            brandId: brandFilter || undefined,
            typeId: typeFilter || undefined
          }
        }
      )
      console.log('Products from API:', res.data)
      setProducts(res.data)
    } catch {
      toast.error('Помилка завантаження продуктів')
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(p =>
    p.productModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.productTypeName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleExportFormat = (format: string) => {
    exportData(format, filteredProducts)
    setIsExportModalOpen(false)
  }

  const handleDeleteProduct = (id: number) =>
    setProducts(prev => prev.filter(p => p.productId !== id))

  return (
    <div className={`flex flex-col gap-6 ${isFilterOpen ? 'w-[75%]' : 'w-[100%]'}`}>
      <Header
        title="Всього продуктів"
        total={products.length}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        triggerSearch={fetchProducts}
        onExportClick={() => setIsExportModalOpen(true)}
        onAddNew={() => setIsCreating(true)}
      >
        <div className="flex flex-col gap-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold mb-1">Бренд:</p>
            <select
              value={brandFilter}
              onChange={e => setBrandFilter(+e.target.value)}
              className="border rounded px-2 py-1 w-full"
            >
              <option value={0}>Всі</option>
              {availableBrands.map(b => (
                <option key={b.brandId} value={b.brandId}>
                  {b.brandName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="font-semibold mb-1">Тип продукту:</p>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(+e.target.value)}
              className="border rounded px-2 py-1 w-full"
            >
              <option value={0}>Всі</option>
              {availableTypes.map(t => (
                <option key={t.productTypeId} value={t.productTypeId}>
                  {t.productTypeName}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchProducts}
            className="mt-2 bg-primary text-white w-full py-2 rounded hover:opacity-90"
          >
            Застосувати фільтри
          </button>
        </div>
      </Header>

      <button
        onClick={() => setIsBasketModalOpen(true)}
        className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 z-50">
        🧾 Оформити замовлення
      </button>

      <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 ${isFilterOpen ? 'xl:grid-cols-2' : 'xl:grid-cols-3'}`}>
        {filteredProducts.map(prod => (
          <ProductCard
            key={prod.productId}
            product={prod}
            searchTerm={searchTerm}
            expandedCardId={expandedCardId}
            setExpandedCardId={setExpandedCardId}
            onDelete={handleDeleteProduct}
            onUpdate={(updated) => {
              setProducts(prev =>
                prev.map(p => p.productId === updated.productId ? updated : p)
              )
            }}
          />
        ))}
      </div>

      {isBasketModalOpen && (
        <BasketModal
          onClose={() => setIsBasketModalOpen(false)}
          onConfirm={async () => {
            const basket = JSON.parse(localStorage.getItem('basket') || '[]')
            try {
              await axios.post('/api/Orders/create-from-basket', basket)
              localStorage.removeItem('basket')
              toast.success('Замовлення оформлено успішно!')
              fetchProducts()
              setIsBasketModalOpen(false)
            } catch {
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

      {isCreating && (
        <AddProduct
          onClose={() => setIsCreating(false)}
          onSave={(created) => {
            setProducts(prev => [...prev, created])
            setIsCreating(false)
          }}
        />
      )}
    </div>
  )
}
