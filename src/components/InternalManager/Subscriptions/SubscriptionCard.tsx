import { useState, useRef, useEffect } from 'react'
import { SubscriptionDto } from '../InternalDtos'
import { highlightMatch } from '../../../utils/highlightMatch'
import EditSubscription from '../Subscriptions/EditSubscription'
import AddPurchaseModal from './AddPurchase'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getAuthHeaders } from '../../../utils/authHeaders'

type Props = {
  subscription: SubscriptionDto
  searchTerm: string
  expandedCardId: number | null
  setExpandedCardId: (id: number | null) => void
  onDelete: (purchaseId: number) => void
  onUpdate: (updated: SubscriptionDto) => void
}

export default function SubscriptionCard({ subscription, searchTerm, expandedCardId, setExpandedCardId, onDelete, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingPurchase, setIsAddingPurchase] = useState(false)
  const isExpanded = expandedCardId === subscription.subscriptionId
  const contentRef = useRef<HTMLDivElement>(null)

  const handleExpandToggle = () => {
    setExpandedCardId(isExpanded ? null : subscription.subscriptionId)
  }

  const handleSave = (updated: SubscriptionDto) => {
    setIsEditing(false)
    onUpdate(updated)
  }

  const handleDelete = async () => {
    const toastId = toast.info(
      <div>
        Ви точно хочете видалити абонемент {subscription.subscriptionName}?
        <div className="flex gap-2 mt-2">
          <button
            onClick={async () => {
              try {
                await axios.delete(`https://localhost:7270/api/Subscriptions/${subscription.subscriptionId}`, {headers: getAuthHeaders()})
                toast.success('Абонемент успішно видалений!')
                onDelete(subscription.subscriptionId)
                toast.dismiss(toastId)
              } catch (error) {
                toast.error('Помилка при видаленні абонемента.')
                toast.dismiss(toastId)
              }
            }}
            className="bg-red-500 text-white px-2 py-1 rounded text-xs"
          >
            Так, видалити
          </button>
          <button
            onClick={() => toast.dismiss(toastId)}
            className="bg-gray-300 px-2 py-1 rounded text-xs"
          >
            Скасувати
          </button>
        </div>
      </div>,
      { autoClose: false }
    )
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
      <div className="flex justify-between items-start text-sm text-gray-500">
        <h3 className="text-lg font-bold text-primary">
          {highlightMatch(subscription.subscriptionName, searchTerm)}
        </h3>
        <button
          className="text-gray-400 hover:text-primary ml-10"
          title="Редагувати"
          onClick={() => setIsEditing(true)}
        >
          ✏️
        </button>
        <button
            className="text-gray-400 hover:text-red-500 mr-1"
            title="Видалити"
            onClick={handleDelete}
          >
            🗑️
          </button>
      </div>

      <p className="text-sm text-gray-700">Ціна: {highlightMatch(subscription.subscriptionTotalCost, searchTerm)} грн</p>
      <p className="text-sm text-gray-700">
        Термін: {highlightMatch(subscription.subscriptionTerm, searchTerm)} | Час: {highlightMatch(subscription.subscriptionVisitTime, searchTerm)}
      </p>

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
                    <p>Ціна за тренування: {a.activityPrice} грн</p>
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
        onClick={() => setIsAddingPurchase(true)}>
        Продати
      </button>

      {isAddingPurchase && (
        <AddPurchaseModal
          subscription={subscription}
          onClose={() => setIsAddingPurchase(false)}
          onSuccess={() => setIsAddingPurchase(false)}
        />
      )}

      {isEditing && (
        <EditSubscription
          subscription={subscription}
          onClose={() => setIsEditing(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
