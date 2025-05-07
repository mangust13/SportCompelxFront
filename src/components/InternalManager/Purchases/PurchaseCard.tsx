import { useState, useRef, useEffect } from 'react'
import { PurchaseDto } from '../../../constants/types'
import { highlightMatch } from '../../../constants/highlightMatch'
import EditPurchaseModal from './EditPurchaseModal'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type Props = {
  purchase: PurchaseDto
  search: string
  expandedCardId: number | null
  setExpandedCardId: (id: number | null) => void
  onDelete: (purchaseId: number) => void
}

export default function PurchaseCard({ purchase, search, expandedCardId, setExpandedCardId, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const isExpanded = expandedCardId === purchase.purchaseNumber
  const contentRef = useRef<HTMLDivElement>(null)

  const handleExpandToggle = () => {
    setExpandedCardId(isExpanded ? null : purchase.purchaseNumber)
  }

  const handleSave = () => {
    setIsEditing(false)
  }

  const handleDelete = async () => {
    const toastId = toast.info(
      <div>
        Ви точно хочете видалити покупку №{purchase.purchaseNumber}?
        <div className="flex gap-2 mt-2">
          <button
            onClick={async () => {
              try {
                await axios.delete(`https://localhost:7270/api/Purchases/${purchase.purchaseId}`)
                toast.success('Покупка успішно видалена!')
                onDelete(purchase.purchaseId)
                toast.dismiss(toastId)
              } catch (error) {
                toast.error('Помилка при видаленні покупки.')
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

  // === СТАТУС ===
  const totalTrainings = purchase.activities.reduce((sum, a) => sum + a.activityTypeAmount, 0)
  const trainingsUsed = purchase.totalAttendances || 0
  const trainingsLeft = totalTrainings - trainingsUsed

  const termMonths = parseInt(purchase.subscriptionTerm.replace(/\D/g, ''), 10) || 0
  const expirationDate = new Date(purchase.purchaseDate)
  expirationDate.setMonth(expirationDate.getMonth() + termMonths)
  const isExpired = new Date() > expirationDate

  const isActive = !isExpired && trainingsLeft > 0

  return (
    <div className={`bg-white shadow-md rounded-xl p-4 flex flex-col gap-2 border-2 ${isActive ? 'border-green-500' : 'border-red-500'}`}>
      {/* Верхній блок */}
      <div className="flex justify-between items-start text-sm text-gray-500">
        <span>{highlightMatch(`Покупка №${purchase.purchaseNumber}`, search)}</span>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-white text-xs ${isActive ? 'bg-green-500' : 'bg-red-500'}`}>
            {isActive ? 'Активний' : 'Неактивний'}
          </span>
          <button className="hover:text-yellow-500" title="Редагувати" onClick={() => setIsEditing(true)}>✏️</button>
          <button className="hover:text-red-500" title="Видалити" onClick={handleDelete}>🗑️</button>
        </div>
      </div>

      {/* Абонемент */}
      <div>
        <h3 className="font-bold text-lg text-primary">
          {highlightMatch(purchase.subscriptionName, search)}
        </h3>
        <p className="text-sm text-gray-700">Ціна: {highlightMatch(purchase.subscriptionTotalCost, search)} грн</p>
        <p className="text-sm text-gray-700">Оплата: {highlightMatch(purchase.paymentMethod, search)}</p>
        <p className="text-sm text-gray-700">
          Термін: {highlightMatch(purchase.subscriptionTerm, search)} | Час:{' '}
          {highlightMatch(purchase.subscriptionVisitTime, search)}
        </p>
        <p className="text-sm text-gray-700">
          Використано тренувань: <span className="font-semibold">{trainingsUsed} / {totalTrainings}</span>
        </p>
        <p className="text-sm text-gray-700">
          Термін дії до:{' '}
          <span className={`px-2 py-0.5 rounded text-white text-xs ${isExpired ? 'bg-red-500' : 'bg-green-500'}`}>
            {expirationDate.toLocaleDateString()}
          </span>
        </p>
      </div>

      {/* Клієнт */}
      <div className="mt-2 text-sm">
        <p><span className="font-semibold">Клієнт:</span> {highlightMatch(purchase.clientFullName, search)}</p>
        <p><span className="font-semibold">Стать:</span> {highlightMatch(purchase.clientGender, search)}</p>
        <p><span className="font-semibold">Телефон:</span> {highlightMatch(purchase.clientPhoneNumber, search)}</p>
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
                  {highlightMatch(a.activityName, search)}
                </span>
              ))}
            </p>
            <button className="text-blue-500 hover:underline text-sm mt-1" onClick={handleExpandToggle}>
              Показати більше
            </button>
          </>
        ) : (
          <>
            <div ref={contentRef} className="expandable-content mt-2">
              <ul className="space-y-2 text-sm text-gray-700">
                {purchase.activities.map((a, i) => (
                  <li key={i} className="border p-2 rounded-md bg-gray-50">
                    <p className="font-semibold">{highlightMatch(a.activityName, search)}</p>
                    <p>Кількість тренувань: {a.activityTypeAmount}</p>
                    <p>Ціна за тренування: {a.activityPrice} грн</p>
                    <p className="text-xs text-gray-600">{highlightMatch(a.activityDescription || '', search)}</p>
                  </li>
                ))}
              </ul>
            </div>
            <button className="text-blue-500 hover:underline text-sm mt-2" onClick={handleExpandToggle}>
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
