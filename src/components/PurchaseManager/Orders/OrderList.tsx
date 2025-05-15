// OrderList.tsx
import { useEffect, useState } from 'react'
import axios from 'axios'
import Header from '../../../layout/Header'
import OrderCard from './OrderCard'
import { renderPagination } from '../../../utils/pagination'
import { ExportModal } from '../../ExportModal'
import { exportData } from '../../../utils/exportData'
import { OrderDto, SupplierDto, BrandDto } from '../PurchaseDtos'

const ITEMS_PER_PAGE = 10

export default function OrderList() {
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [search, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [sortBy, setSortBy] = useState<'orderDate' | 'orderNumber'>('orderDate')
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

  useEffect(() => {
    axios.get<SupplierDto[]>('https://localhost:7270/api/Orders/all-suppliers')
      
      .then(res => {
    const data = Array.isArray(res.data) ? res.data : []
    setAvailableSuppliers(data)
  })
      .catch(() => {})

    axios.get<BrandDto[]>('https://localhost:7270/api/Orders/all-brands')
      .then(res => setAvailableBrands(res.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    axios.get<OrderDto[]>('https://localhost:7270/api/Orders/all-orders', {
      params: {
        sortBy,
        order: sortOrder,
        supplierId: supplierFilter || undefined,
        brandId: brandFilter || undefined,
        minTotal: minTotal ?? undefined,
        maxTotal: maxTotal ?? undefined,
        orderDate: orderDate || undefined
      }
    })
      .then(res => {
        setOrders(res.data)
        setCurrentPage(1)
      })
      .catch(() => {})
  }, [trigger, sortBy, sortOrder])

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toString().includes(search) ||
    order.supplierName.toLowerCase().includes(search.toLowerCase()) ||
    order.orderTotalPrice.toString().includes(search) ||
    order.paymentMethod.toLowerCase().includes(search.toLowerCase()) ||
    order.orderStatus.toLowerCase().includes(search.toLowerCase()) ||
    new Date(order.orderDate).toLocaleDateString().toLowerCase().includes(search.toLowerCase()) ||
    order.purchasedProducts.some(p =>
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      p.quantity.toString().includes(search) ||
      p.unitPrice.toString().includes(search) ||
      p.brandName.toLowerCase().includes(search.toLowerCase()) ||
      p.productType.toLowerCase().includes(search.toLowerCase())
    )
  )

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
  const visibleOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleExportFormat = (format: string) => {
    exportData(format, filteredOrders)
    setIsExportModalOpen(false)
  }

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
        setSortBy={value => setSortBy(value as any)}
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
          <div>
            <p className="font-semibold mb-1">Постачальник:</p>
            <select
              value={supplierFilter}
              onChange={e => setSupplierFilter(Number(e.target.value))}
              className="border rounded px-2 py-1 w-full"
            >
              <option value={0}>Всі</option>
              {availableSuppliers.map(s => (
                <option key={s.supplierId} value={s.supplierId}>{s.supplierName}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="font-semibold mb-1">Бренд:</p>
            <select
              value={brandFilter}
              onChange={e => setBrandFilter(Number(e.target.value))}
              className="border rounded px-2 py-1 w-full"
            >
              <option value={0}>Всі</option>
              {availableBrands.map(b => (
                <option key={b.brandId} value={b.brandId}>{b.brandName}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="font-semibold mb-1">Сума (грн):</p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="від"
                value={minTotal ?? ''}
                onChange={e => setMinTotal(e.target.value ? +e.target.value : null)}
                className="border rounded px-2 py-1 w-full"
              />
              <input
                type="number"
                placeholder="до"
                value={maxTotal ?? ''}
                onChange={e => setMaxTotal(e.target.value ? +e.target.value : null)}
                className="border rounded px-2 py-1 w-full"
              />
            </div>
          </div>
          <div>
            <p className="font-semibold mb-1">Дата замовлення:</p>
            <input
              type="date"
              value={orderDate}
              onChange={e => setOrderDate(e.target.value)}
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

      <div className="grid gap-4 grid-cols-1">
        {visibleOrders.map(order => (
          <OrderCard
            key={order.orderId}
            order={order}
            search={search}
            expandedCardId={expandedCardId}
            setExpandedCardId={setExpandedCardId}
            onUpdate={(updatedOrder) =>
              setOrders(prev => prev.map(o => o.orderId === updatedOrder.orderId ? updatedOrder : o))
            }
          />
        ))}
      </div>

      <div className="flex justify-center mt-6 gap-2 flex-wrap">
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
        <ExportModal onClose={() => setIsExportModalOpen(false)} onSelectFormat={handleExportFormat} />
      )}
    </div>
  )
}
