import { useState, useRef, useEffect } from 'react'
import { SubscriptionDto } from '../../../constants/types'
import { highlightMatch } from '../../../constants/highlightMatch'
import EditPurchaseModal from '../Purchases/EditPurchaseModal'
import AddPurchaseModal from './AddPurchase'

type Props = {
  subscription: SubscriptionDto
  searchTerm: string
  expandedCardId: number | null
  setExpandedCardId: (id: number | null) => void
}

export default function SubscriptionCard({ subscription, searchTerm, expandedCardId, setExpandedCardId }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingPurchase, setIsAddingPurchase] = useState(false)
  const isExpanded = expandedCardId === subscription.subscriptionId
  const contentRef = useRef<HTMLDivElement>(null)

  const handleExpandToggle = () => {
    setExpandedCardId(isExpanded ? null : subscription.subscriptionId)
  }

  const handleSave = (updated: SubscriptionDto) => {
    setIsEditing(false)
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
      {/* Верхній блок: Назва + Іконка */}
      <div className="flex justify-between items-start text-sm text-gray-500">
        <h3 className="text-lg font-bold text-primary">
          {highlightMatch(subscription.subscriptionName, searchTerm)}
        </h3>
        <button
          className="text-gray-400 hover:text-primary"
          title="Редагувати"
          onClick={() => setIsEditing(true)}
        >
          ✏️
        </button>
      </div>

      {/* Основна інформація про підписку */}
      <p className="text-sm text-gray-700">Ціна: {subscription.subscriptionTotalCost} грн</p>
      <p className="text-sm text-gray-700">
        Термін: {highlightMatch(subscription.subscriptionTerm, searchTerm)} | Час: {highlightMatch(subscription.subscriptionVisitTime, searchTerm)}
      </p>

      

      {/* Види активності */}
      <div className="mt-2 text-sm">
        <p className="font-semibold mb-1">Види активності:</p>

        {!isExpanded ? (
          <>
            <p className="text-gray-700">
              {subscription.activities.map((a, i) => (
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
                {subscription.activities.map((a, i) => (
                  <li key={i} className="border p-2 rounded-md bg-gray-50">
                    <p className="font-semibold">{highlightMatch(a.activityName, searchTerm)}</p>
                    <p>Ціна: {a.activityPrice} грн</p>
                    <p>Кількість тренувань: {a.activityTypeAmount}</p>
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
      <button
        className="mt-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
        onClick={() => setIsAddingPurchase(true)}
      >
        Придбати
      </button>

      {isAddingPurchase && (
        <AddPurchaseModal
          subscription={subscription}
          onClose={() => setIsAddingPurchase(false)}
          onSuccess={() => setIsAddingPurchase(false)}
        />
      )}
      {/* Модальне вікно редагування підписки */}
      {/* {isEditing && (
        <EditPurchaseModal
          subscription={subscription}
          onClose={() => setIsEditing(false)}
          onSave={handleSave}
        />
      )} */}
    </div>
  )
}
