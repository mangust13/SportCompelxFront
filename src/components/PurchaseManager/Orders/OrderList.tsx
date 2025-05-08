import { useEffect, useState } from 'react'
import axios from 'axios'
import { OrderDto } from '../../../constants/types'
import Header from '../../../layout/Header'
import OrderCard from './OrderCard'
import { renderPagination } from '../../../constants/pagination'
import { ExportModal } from '../../ExportModal'
import {exportData} from '../../../constants/exportData'

type SupplierDto = { supplierId: number, supplierName: string }
type BrandDto = { brandId: number, brandName: string }

const ITEMS_PER_PAGE = 10

export default function OrderList() {
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [search, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [sortBy, setSortBy] = useState('orderDate')

  const [supplierFilter, setSupplierFilter] = useState<number>(0) 
  const [brandFilter, setBrandFilter] = useState<number>(0)     
  const [minTotal, setMinTotal] = useState<number | null>(null)
  const [maxTotal, setMaxTotal] = useState<number | null>(null)
  const [orderDate, setOrderDate] = useState<string>('')

  const [availableSuppliers, setAvailableSuppliers] = useState<SupplierDto[]>([])
  const [availableBrands, setAvailableBrands] = useState<BrandDto[]>([])

  const [trigger, setTrigger] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const handleExportFormat = (format: string) => {
    exportData(format, filteredOrders)
    setIsExportModalOpen(false)
  }  

  useEffect(() => {
    axios.get<SupplierDto[]>('https://localhost:7270/api/Orders/all-suppliers')
      .then(res => setAvailableSuppliers(res.data))
      .catch(err => console.error('Помилка завантаження постачальників:', err))

    axios.get<BrandDto[]>('https://localhost:7270/api/Orders/all-brands')
      .then(res => setAvailableBrands(res.data))
      .catch(err => console.error('Помилка завантаження брендів:', err))
  }, [])

  useEffect(() => {
    axios.get<OrderDto[]>('https://localhost:7270/api/Orders/all-orders', {
      params: {
        sortBy,
        order: sortOrder,
        supplierId: supplierFilter !== 0 ? supplierFilter : undefined,
        brandId: brandFilter !== 0 ? brandFilter : undefined,
        minTotal,
        maxTotal,
        orderDate
      }
    })
      .then(res => {
        setOrders(res.data)
        setCurrentPage(1)
      })
      .catch(err => console.error(err))
  }, [trigger, sortBy, sortOrder])

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toString().toLowerCase().includes(search.toLowerCase()) ||
    order.supplierName.toLowerCase().includes(search.toLowerCase()) ||
    order.orderTotalPrice.toString().includes(search) ||
    order.paymentMethod.toLowerCase().includes(search.toLowerCase()) ||
    order.orderStatus.toLowerCase().includes(search.toLowerCase()) ||
    (new Date(order.orderDate).toLocaleDateString().toLowerCase().includes(search.toLowerCase())) ||
    order.purchasedProducts.some(product =>
      product.productName.toLowerCase().includes(search.toLowerCase()) ||
      product.quantity.toString().includes(search) ||
      product.unitPrice.toString().includes(search) ||
      product.productDescription.toLowerCase().includes(search.toLowerCase()) ||
      product.brandName.toLowerCase().includes(search.toLowerCase()) ||
      product.productType.toLowerCase().includes(search.toLowerCase())
    )
  )

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)

  const visibleOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className={`flex flex-col gap-6 ${isFilterOpen ? 'w-[75%]' : 'w-[100%]'}`}>
      <Header
        title="Всього замовлень"
        total={orders.length}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        searchTerm={search}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        sortOptions={[
          { value: 'orderNumber', label: 'Номер замовлення' },
          { value: 'orderDate', label: 'Дата замовлення' }
        ]}
        triggerSearch={() => setTrigger(prev => prev + 1)}
        onExportClick={() => setIsExportModalOpen(true)}
      >
        <div className="flex flex-col gap-4 text-sm text-gray-700">
          {/* Supplier filter */}
          <div>
            <p className="font-semibold mb-1">Постачальник:</p>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(Number(e.target.value))}
              className="border rounded px-2 py-1 w-full"
            >
              <option value={0}>Всі</option>
              {availableSuppliers.map(s => (
                <option key={s.supplierId} value={s.supplierId}>{s.supplierName}</option>
              ))}
            </select>
          </div>

          {/* Brand filter */}
          <div>
            <p className="font-semibold mb-1">Бренд товару:</p>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(Number(e.target.value))}
              className="border rounded px-2 py-1 w-full"
            >
              <option value={0}>Всі</option>
              {availableBrands.map(b => (
                <option key={b.brandId} value={b.brandId}>{b.brandName}</option>
              ))}
            </select>
          </div>

          {/* Total price filter */}
          <div>
            <p className="font-semibold mb-1">Сума замовлення (грн):</p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="від"
                value={minTotal ?? ''}
                onChange={(e) => setMinTotal(e.target.value ? Number(e.target.value) : null)}
                className="border rounded px-2 py-1 w-full"
              />
              <input
                type="number"
                placeholder="до"
                value={maxTotal ?? ''}
                onChange={(e) => setMaxTotal(e.target.value ? Number(e.target.value) : null)}
                className="border rounded px-2 py-1 w-full"
              />
            </div>
          </div>

          {/* Date filter */}
          <div>
            <p className="font-semibold mb-1">Дата замовлення:</p>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          <button
            onClick={() => setTrigger(prev => prev + 1)}
            className="mt-4 bg-primary text-white w-full py-2 rounded hover:opacity-90"
          >
            Застосувати фільтри
          </button>
        </div>
      </Header>

      <div className={`grid gap-4 grid-cols-1`}>
        {visibleOrders.map(order => (
          <OrderCard
            key={order.orderId}
            order={order}
            search={search}
            expandedCardId={expandedCardId}
            setExpandedCardId={setExpandedCardId}
          />
        ))}
      </div>

      <div className="flex justify-center mt-6 gap-2 items-center flex-wrap">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={`w-8 h-8 rounded text-sm ${
            currentPage === 1 ? 'bg-gray-200 text-gray-400' : 'bg-white border hover:bg-gray-100 text-gray-700'
          }`}
        >
          &lt;
        </button>

        {renderPagination(currentPage, totalPages, setCurrentPage)}

        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className={`w-8 h-8 rounded text-sm ${
            currentPage === totalPages ? 'bg-gray-200 text-gray-400' : 'bg-white border hover:bg-gray-100 text-gray-700'
          }`}
        >
          &gt;
        </button>
      </div>

      {isExportModalOpen && (
        <ExportModal
          onClose={() => setIsExportModalOpen(false)}
          onSelectFormat={handleExportFormat}
        />
      )}
    </div>
  )
}