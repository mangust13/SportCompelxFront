import { useState, useRef, useEffect } from 'react'
import { PurchaseDto } from '../../../constants/types'
import { highlightMatch } from '../../../constants/highlightMatch'
import EditPurchaseModal from './EditPurchaseModal'

type Props = {
  purchase: PurchaseDto
  searchTerm: string
  expandedCardId: number | null
  setExpandedCardId: (id: number | null) => void
}

export default function PurchaseCard({
  purchase,
  searchTerm,
  expandedCardId,
  setExpandedCardId,
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const isExpanded = expandedCardId === purchase.purchaseNumber
  const contentRef = useRef<HTMLDivElement>(null)

  const handleExpandToggle = () => {
    setExpandedCardId(isExpanded ? null : purchase.purchaseNumber)
  }

  const handleSave = (updated: PurchaseDto) => {
    console.log('Збережено:', updated)
    setIsEditing(false)
    // Тут пізніше можна додати оновлення в PurchaseList
  }

  useEffect(() => {
    const content = contentRef.current
    if (!content) return

    if (isExpanded) {
      content.style.maxHeight = content.scrollHeight + 'px'
      content.style.opacity = '1'
    } else {
      content.style.maxHeight = '0px'
      content.style.opacity = '0'
    }
  }, [isExpanded])

  return (
    <div className="bg-white shadow-md rounded-xl p-4 flex flex-col gap-2">
      {/* Верхній блок: номер + дата + іконка */}
      <div className="flex justify-between items-start text-sm text-gray-500">
        <span>{highlightMatch(`Покупка №${purchase.purchaseNumber}`, searchTerm)}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{new Date(purchase.purchaseDate).toLocaleDateString()}</span>
          <button
            className="text-gray-400 hover:text-primary"
            title="Редагувати"
            onClick={() => setIsEditing(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 
                2.652 2.652L6.832 19.82a4.5 4.5 
                0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 
                0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
          </button>
        </div>
      </div>

      {/* Підписка */}
      <div>
        <h3 className="font-bold text-lg text-primary">
          {highlightMatch(purchase.subscriptionName, searchTerm)}
        </h3>
        <p className="text-sm text-gray-700">Ціна: {purchase.subscriptionTotalCost} грн</p>
        <p className="text-sm text-gray-700">Оплата: {highlightMatch(purchase.paymentMethod, searchTerm)}</p>

        <p className="text-sm text-gray-700">
          Термін: {highlightMatch(purchase.subscriptionTerm, searchTerm)} | Час:{' '}
          {highlightMatch(purchase.subscriptionVisitTime, searchTerm)}
        </p>
      </div>

      {/* Клієнт */}
      <div className="mt-2 text-sm">
        <p><span className="font-semibold">Клієнт:</span> {highlightMatch(purchase.clientFullName, searchTerm)}</p>
        <p><span className="font-semibold">Стать:</span> {highlightMatch(purchase.clientGender, searchTerm)}</p>
        <p><span className="font-semibold">Телефон:</span> {highlightMatch(purchase.clientPhoneNumber, searchTerm)}</p>
      </div>

      {/* Види активності */}
      <div className="mt-2 text-sm">
        <p className="font-semibold mb-1">Види активності:</p>

        {!isExpanded ? (
          <>
            <p className="text-gray-700">
              {purchase.activities.map((a, i) => (
                <span key={i}>
                  {i > 0 && ', '}
                  {highlightMatch(a.activityName, searchTerm)}
                </span>
              ))}
            </p>
            <button
              className="text-blue-500 hover:underline text-sm mt-1"
              onClick={handleExpandToggle}
            >
              Показати більше
            </button>
          </>
        ) : (
          <>
            <div ref={contentRef} className="expandable-content mt-2">
              <ul className="space-y-2 text-sm text-gray-700">
                {purchase.activities.map((a, i) => (
                  <li key={i} className="border p-2 rounded-md bg-gray-50">
                    <p className="font-semibold">{highlightMatch(a.activityName, searchTerm)}</p>
                    <p>Кількість тренувань: {a.activityTypeAmount}</p>
                    <p>Ціна за тренування: {a.activityPrice} грн</p>
                    <p className="text-xs text-gray-600">{highlightMatch(a.activityDescription || '', searchTerm)}</p>
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="text-blue-500 hover:underline text-sm mt-2"
              onClick={handleExpandToggle}
            >
              Згорнути
            </button>
          </>
        )}
      </div>

      {/* Модальне вікно */}
      {isEditing && (
        <EditPurchaseModal
          purchase={purchase}
          onClose={() => setIsEditing(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
