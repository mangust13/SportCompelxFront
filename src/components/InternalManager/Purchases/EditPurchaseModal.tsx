import { useState, useEffect } from 'react'
import { PurchaseDto } from '../../../constants/types'

type Props = {
  purchase: PurchaseDto
  onClose: () => void
  onSave: (updated: PurchaseDto) => void
}

export default function EditPurchaseModal({ purchase, onClose, onSave }: Props) {
    type Activity = PurchaseDto['activities'][number]
  const [edited, setEdited] = useState<PurchaseDto>(purchase)
  const [allActivities, setAllActivities] = useState<Activity[]>([])
  const [allSubscriptions, setAllSubscriptions] = useState<string[]>([])
  const [allTerms, setAllTerms] = useState<string[]>([])
  const [allTimes, setAllTimes] = useState<string[]>([])
  const [allGenders, setAllGenders] = useState<string[]>([])
  const [allPayments, setAllPayments] = useState<string[]>([])

  useEffect(() => {
    setEdited(purchase)

    // Симулюємо fetch класифікаторів
    setAllSubscriptions(['Premium Basic Cardio', 'Elite Standard Strength', 'Basic Yoga'])
    setAllTerms(['1 month', '3 months', '6 months', '12 months'])
    setAllTimes(['Morning', 'Day', 'Evening', 'Unlimited'])
    setAllGenders(['Male', 'Female'])
    setAllPayments(['Cash', 'Card', 'Online'])

    setAllActivities([
      { activityName: 'Yoga', activityDescription: 'Relax', activityPrice: 10, activityTypeAmount: 5 },
      { activityName: 'BodyPump', activityDescription: 'Strength', activityPrice: 20, activityTypeAmount: 8 },
      { activityName: 'Zumba', activityDescription: 'Dance cardio', activityPrice: 15, activityTypeAmount: 6 },
    ])
  }, [purchase])

  const handleChange = (field: keyof PurchaseDto, value: any) => {
    setEdited({ ...edited, [field]: value })
  }

  const handleActivityChange = (index: number, field: keyof Activity, value: any) => {
    const updated = [...edited.activities]
    updated[index] = { ...updated[index], [field]: value }
    setEdited({ ...edited, activities: updated })
  }

  const calculateTotal = () => {
    const sum = edited.activities.reduce((acc, a) => acc + a.activityPrice * a.activityTypeAmount, 0)
    return sum
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
            value={edited.clientGender}
            onChange={e => handleChange('clientGender', e.target.value)}
            className="border p-2 rounded"
          >
            {allGenders.map(g => <option key={g}>{g}</option>)}
          </select>
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
          <select
            value={edited.subscriptionTerm}
            onChange={e => handleChange('subscriptionTerm', e.target.value)}
            className="border p-2 rounded"
          >
            {allTerms.map(s => <option key={s}>{s}</option>)}
          </select>
          <select
            value={edited.subscriptionVisitTime}
            onChange={e => handleChange('subscriptionVisitTime', e.target.value)}
            className="border p-2 rounded"
          >
            {allTimes.map(s => <option key={s}>{s}</option>)}
          </select>

          <div className="font-semibold text-gray-700 mt-1 col-span-full">
            Загальна вартість: {calculateTotal()} грн
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-2">Види активності</h3>
          <div className="space-y-3">
            {edited.activities.map((a, index) => (
              <div key={index} className="border p-3 rounded bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-2">
                <select
                  value={a.activityName}
                  onChange={e => handleActivityChange(index, 'activityName', e.target.value)}
                  className="border p-2 rounded"
                >
                  {allActivities.map(opt => (
                    <option key={opt.activityName}>{opt.activityName}</option>
                  ))}
                </select>
                <input
                  type="number"
                  className="border p-2 rounded"
                  value={a.activityTypeAmount}
                  onChange={e => handleActivityChange(index, 'activityTypeAmount', +e.target.value)}
                  placeholder="Кількість"
                />
                <input
                  type="number"
                  className="border p-2 rounded"
                  value={a.activityPrice}
                  onChange={e => handleActivityChange(index, 'activityPrice', +e.target.value)}
                  placeholder="Ціна"
                />
              </div>
            ))}
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
