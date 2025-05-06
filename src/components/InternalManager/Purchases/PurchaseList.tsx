import { useEffect, useState } from 'react'
import axios from 'axios'
import { PurchaseDto } from '../../../constants/types'
import PurchaseCard from './PurchaseCard'
import Header from '../../../layout/Header'

const ITEMS_PER_PAGE = 15

export default function PurchaseList() {
  const [allPurchases, setAllPurchases] = useState<PurchaseDto[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [search, setSearchTerm] = useState('')
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState('purchaseDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [activityFilters, setActivityFilters] = useState<string[]>([])
  const [availableActivities, setAvailableActivities] = useState<string[]>([])
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([])
  const [selectedGender, setSelectedGender] = useState<string>('')
  const [minCost, setMinCost] = useState<number | null>(null)
  const [maxCost, setMaxCost] = useState<number | null>(null)
  const [purchaseDate, setPurchaseDate] = useState<string>('')
  const [trigger, setTrigger] = useState(0)

  const filteredPurchases = allPurchases.filter(p =>
    p.purchaseNumber.toString().toLowerCase().includes(search.toLowerCase()) ||
    p.subscriptionName.toString().toLowerCase().includes(search.toLowerCase()) ||
    p.subscriptionTotalCost.toString().includes(search) ||
    p.paymentMethod.toString().includes(search) || 
    p.subscriptionTerm.toLowerCase().includes(search.toLowerCase()) ||
    p.subscriptionVisitTime.toLowerCase().includes(search.toLowerCase()) ||
    p.clientFullName.toLowerCase().includes(search.toLowerCase()) ||
    p.clientGender.toString().toLowerCase().includes(search.toLowerCase()) ||
    p.clientPhoneNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.activities.some(a =>
      a.activityName.toLowerCase().includes(search.toLowerCase())
    )
  )

  
  const handleDeletePurchase = (purchaseId: number) => {
    setAllPurchases(prev => prev.filter(p => p.purchaseId !== purchaseId))
  }

  useEffect(() => {
    axios.get('https://localhost:7270/api/Activities')
      .then(res => {
        const names = res.data.map((a: any) => a.activityName)
        setAvailableActivities(names)
      })
      .catch(err => console.error('Помилка завантаження активностей:', err))
  }, [])
  
  useEffect(() => {
    axios
      .get('https://localhost:7270/api/Purchases/purchases-view', {
        params: {
          sortBy,
          order: sortOrder,
          activities: activityFilters.join(','),
          paymentMethods: selectedPaymentMethods.join(','),
          clientGender: selectedGender,
          minCost,
          maxCost,
          purchaseDate
        }
      })
      .then(res => {
        setAllPurchases(res.data)
        setCurrentPage(1)
      })
      .catch(err => console.error('Помилка завантаження:', err))
  }, [trigger, sortBy, sortOrder])

  const totalPages = Math.ceil(allPurchases.length / ITEMS_PER_PAGE)

  const visiblePurchases = allPurchases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const renderPagination = () => {
    const pages = []
    pages.push(1)

    if (currentPage > 3) pages.push('...')

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) pages.push(i)

    if (currentPage < totalPages - 2) pages.push('...')
    if (totalPages > 1) pages.push(totalPages)

    return pages.map((page, idx) =>
      typeof page === 'number' ? (
        <button
          key={idx}
          onClick={() => setCurrentPage(page)}
          className={`w-8 h-8 rounded text-sm ${
            currentPage === page
              ? 'bg-primary text-white'
              : 'bg-white border text-gray-600 hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ) : (
        <span key={idx} className="px-2 text-gray-400 text-sm">...</span>
      )
    )
  }

  return (
    <div className={`flex flex-col gap-6 ${isFilterOpen ? 'w-[75%]' : 'w-[100%]'}`}>
      <Header
        title="Всього покупок"
        total={allPurchases.length}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        searchTerm={search}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        sortOptions={[
          { value: 'purchaseNumber', label: 'Номер покупки' },
          { value: 'purchaseDate', label: 'Дата покупки' },
          { value: 'subscriptionTotalCost', label: 'Ціна абонемента' },
          { value: 'subscriptionName', label: 'Назва абонемента' }
        ]}
        triggerSearch={() => setTrigger(prev => prev +1)}>
          
        <div className="flex flex-col gap-4 text-sm text-gray-700">
          {/* Payment methods */}
          <p className="font-semibold">Метод оплати:</p>
          <div className="flex gap-4 flex-wrap">
            {['Готівка', 'Карта'].map(method => (
              <label key={method} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selectedPaymentMethods.includes(method)}
                  onChange={() =>
                    setSelectedPaymentMethods(prev =>
                      prev.includes(method)
                        ? prev.filter(m => m !== method)
                        : [...prev, method]
                    )
                  }
                />
                {method}
              </label>
            ))}
          </div>

          {/* Cost */}
          <div>
            <p className="font-semibold mb-1">Вартість абонемента (грн):</p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="від"
                value={minCost ?? ''}
                onChange={(e) => setMinCost(e.target.value ? Number(e.target.value) : null)}
                className="border rounded px-2 py-1 w-full"
              />
              <input
                type="number"
                placeholder="до"
                value={maxCost ?? ''}
                onChange={(e) => setMaxCost(e.target.value ? Number(e.target.value) : null)}
                className="border rounded px-2 py-1 w-full"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <p className="font-semibold mb-1">Дата покупки:</p>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          {/* Gender */}
          <div>
            <p className="font-semibold mb-1">Стать клієнта:</p>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            >
              <option value="">Всі</option>
              <option value="Чоловік">Чоловік</option>
              <option value="Жінка">Жінка</option>
            </select>
          </div>

          {/* Activities */}
          <div>
            <p className="font-semibold mb-1">Види активностей:</p>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              {availableActivities.map(name => (
                <label key={name} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={activityFilters.includes(name)}
                    onChange={() =>
                      setActivityFilters(prev =>
                        prev.includes(name)
                          ? prev.filter(a => a !== name)
                          : [...prev, name]
                      )
                    }
                  />
                  {name}
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={() => setTrigger(prev => prev + 1)}
            className="mt-4 bg-primary text-white w-full py-2 rounded hover:opacity-90"
          >
            Застосувати фільтри
          </button>
        </div>
      </Header>


      <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 ${isFilterOpen ? 'xl:grid-cols-2' : 'xl:grid-cols-3'} items-start`}>
        {filteredPurchases.map(p => (
          <PurchaseCard 
            key={p.purchaseNumber} 
            purchase={p} 
            searchTerm={search}
            expandedCardId={expandedCardId}
            setExpandedCardId={setExpandedCardId}
            onDelete={handleDeletePurchase}/>
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

        {renderPagination()}

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
    </div>
  )
}
