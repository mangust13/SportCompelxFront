import { useEffect, useState } from 'react'
import axios from 'axios'
import { PurchaseDto } from '../../constants/types'
import PurchaseCard from './PurchaseCard'
import PurchaseHeader from './PurchaseHeader'

const ITEMS_PER_PAGE = 15

export default function PurchaseList() {
  const [allPurchases, setAllPurchases] = useState<PurchaseDto[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null)

  useEffect(() => {
    axios
      .get('https://localhost:7270/api/purchase/manager-view', {
        params: {
          searchTerm
        }
      })
      .then(res => {
        setAllPurchases(res.data)
        setCurrentPage(1)
      })
      .catch(err => console.error('Помилка завантаження:', err))
  }, [searchTerm])

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
      <PurchaseHeader
        total={allPurchases.length}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        searchTerm={searchTerm} // поки не використовуємо
        setSearchTerm={setSearchTerm} // пусто
      />

      <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 ${isFilterOpen ? 'xl:grid-cols-2' : 'xl:grid-cols-3'} items-start`}>
        {visiblePurchases.map(p => (
          <PurchaseCard 
            key={p.purchaseNumber} 
            purchase={p} 
            searchTerm={searchTerm}
            expandedCardId={expandedCardId}
            setExpandedCardId={setExpandedCardId}/>
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
