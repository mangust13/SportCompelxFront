import { useState, useEffect } from 'react'
import { PurchaseDto } from '../../../constants/types'

type Props = {
  purchase: PurchaseDto
  onClose: () => void
  onSave: (updated: PurchaseDto) => void
}

export default function EditPurchaseModal({ purchase, onClose, onSave }: Props) {
  const [edited, setEdited] = useState<PurchaseDto>(purchase)
  const [allSubscriptions, setAllSubscriptions] = useState<string[]>([])
  const [allPayments, setAllPayments] = useState<string[]>([])

  useEffect(() => {
    setEdited(purchase)

    // Симулюємо fetch класифікаторів
    setAllSubscriptions(['Premium Basic Cardio', 'Elite Standard Strength', 'Basic Yoga'])
    setAllPayments(['Карта', 'Готівка'])

  }, [purchase])

  const handleChange = (field: keyof PurchaseDto, value: any) => {
    setEdited({ ...edited, [field]: value })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-lg overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary">Редагування покупки</h2>
          <button onClick={onClose} className="text-2xl text-gray-500 hover:text-red-500">&times;</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <input
            value={edited.clientFullName}
            onChange={e => handleChange('clientFullName', e.target.value)}
            className="border p-2 rounded"
            placeholder="Ім'я клієнта"
          />
          <input
            value={edited.clientPhoneNumber}
            onChange={e => handleChange('clientPhoneNumber', e.target.value)}
            className="border p-2 rounded"
            placeholder="Телефон"
          />
          <select
            value={edited.paymentMethod}
            onChange={e => handleChange('paymentMethod', e.target.value)}
            className="border p-2 rounded"
          >
            {allPayments.map(p => <option key={p}>{p}</option>)}
          </select>
          <select
            value={edited.subscriptionName}
            onChange={e => handleChange('subscriptionName', e.target.value)}
            className="border p-2 rounded"
          >
            {allSubscriptions.map(s => <option key={s}>{s}</option>)}
          </select>

          <div className="font-semibold text-gray-700 mt-1 col-span-full">
            Загальна вартість: {allSubscriptions} грн
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Скасувати
          </button>
          <button
            onClick={() => onSave(edited)}
            className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
          >
            Зберегти
          </button>
        </div>
      </div>
    </div>
  )
}
