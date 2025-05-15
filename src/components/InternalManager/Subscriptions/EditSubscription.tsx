import { useEffect, useState } from 'react'
import axios from 'axios'
import { SubscriptionDto, ActivityDto } from '../InternalDtos'
import { toast } from 'react-toastify'
import { getAuthHeaders } from '../../../utils/authHeaders'

type Props = {
  subscription: SubscriptionDto
  onClose: () => void
  onSave: (updated: SubscriptionDto) => void
}

export default function EditSubscription({ subscription, onClose, onSave }: Props) {
  const [activities, setActivities] = useState<ActivityDto[]>([])
  const [selectedActivities, setSelectedActivities] = useState<{ activity: ActivityDto; count: number }[]>([])
  const [selectedTerm, setSelectedTerm] = useState(subscription.subscriptionTerm)
  const [selectedVisitTime, setSelectedVisitTime] = useState(subscription.subscriptionVisitTime)
  const [customPrice, setCustomPrice] = useState<number | null>(null)

  const availableTerms = ['1 місяць', '3 місяці', '6 місяців', '12 місяців']
  const availableTimes = ['Ранковий', 'Вечірний', 'Безлімітний']

  const termPrices: Record<string, number> = {
    '1 місяць': 300,
    '3 місяці': 500,
    '6 місяців': 1000,
    '12 місяців': 2000
  }

  const visitPrices: Record<string, number> = {
    'Ранковий': 300,
    'Вечірний': 300,
    'Безлімітний': 600
  }

  useEffect(() => {
    axios.get<ActivityDto[]>('https://localhost:7270/api/Activities')
      .then(res => {
        setActivities(res.data)

        if (selectedActivities.length === 0) {
          const mapped = subscription.activities.map(a => {
            const match = res.data.find(x => x.activityName === a.activityName)
            return match ? { activity: match, count: a.activityTypeAmount } : null
          }).filter(Boolean) as { activity: ActivityDto; count: number }[]
          setSelectedActivities(mapped)
        }
      })
      .catch(err => console.error('Помилка завантаження активностей:', err))
  }, [])

  const handleToggleActivity = (a: ActivityDto) => {
    setSelectedActivities(prev => {
      const index = prev.findIndex(p => p.activity.activityId === a.activityId)
      if (index !== -1) {
        const newArr = [...prev]
        newArr.splice(index, 1)
        return newArr
      }
      return [...prev, { activity: a, count: 5 }]
    })
  }

  const handleActivityChange = (id: number, value: number) => {
    if (isNaN(value) || value <= 0) return
    setSelectedActivities(prev =>
      prev.map(p =>
        p.activity.activityId === id ? { ...p, count: value } : p
      )
    )
  }

  const calculatedCost = selectedActivities.reduce(
    (sum, a) => sum + a.activity.activityPrice * a.count,
    0
  ) + (termPrices[selectedTerm] || 0) + (visitPrices[selectedVisitTime] || 0)

  const totalCost = customPrice !== null ? customPrice : calculatedCost

  const handleSave = async () => {
    try {
      await axios.put(
        `https://localhost:7270/api/Subscriptions/${subscription.subscriptionId}`,
        {
          subscriptionTotalCost: totalCost,
          subscriptionTerm: selectedTerm,
          subscriptionVisitTime: selectedVisitTime,
          activities: selectedActivities.map(a => ({
            activityName: a.activity.activityName,
            activityPrice: a.activity.activityPrice,
            activityDescription: a.activity.activityDescription,
            activityTypeAmount: a.count
          }))
        },
        { headers: getAuthHeaders() }
      )
      toast.success('Абонемент оновлено!')

      const updated: SubscriptionDto = {
        ...subscription,
        subscriptionTotalCost: totalCost,
        subscriptionTerm: selectedTerm,
        subscriptionVisitTime: selectedVisitTime,
        activities: selectedActivities.map(a => ({
          activityName: a.activity.activityName,
          activityPrice: a.activity.activityPrice,
          activityDescription: a.activity.activityDescription,
          activityTypeAmount: a.count
        }))
      }

      onSave(updated)
      onClose()
    } catch (err) {
      toast.error('Помилка при оновленні абонемента.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-xl p-6 w-[550px] max-h-[90vh] overflow-y-auto flex flex-col gap-4">
        <h2 className="text-lg font-bold text-primary">Редагування абонемента</h2>

        <div>
          <label className="text-sm font-medium">Термін дії</label>
          <select
            value={selectedTerm}
            onChange={e => setSelectedTerm(e.target.value)}
            className="w-full border px-2 py-1 rounded mt-1"
          >
            {availableTerms.map(term => (
              <option key={term} value={term}>{term}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Час відвідування</label>
          <select
            value={selectedVisitTime}
            onChange={e => setSelectedVisitTime(e.target.value)}
            className="w-full border px-2 py-1 rounded mt-1"
          >
            {availableTimes.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm font-medium">Активності</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {activities.map(a => {
              const selected = selectedActivities.find(s => s.activity.activityId === a.activityId)
              const isSelected = !!selected
              return (
                <div
                  key={a.activityId}
                  className={`border p-3 rounded cursor-pointer ${isSelected ? 'bg-primary text-white' : 'bg-gray-100'}`}
                  onClick={() => handleToggleActivity(a)}
                >
                  <p className="font-semibold">{a.activityName}</p>
                  {isSelected && (
                    <div className="mt-2 space-y-1 text-sm text-white">
                      <div className="flex gap-2 items-center">
                        <span>Кількість:</span>
                        <input
                          type="number"
                          min={1}
                          value={selected!.count}
                          onClick={e => e.stopPropagation()}
                          onChange={e => handleActivityChange(a.activityId, Number(e.target.value))}
                          className="w-16 rounded px-1 text-black"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Ручна вартість (необов’язково)</label>
          <input
            type="number"
            className="w-full border px-2 py-1 rounded mt-1"
            value={customPrice ?? ''}
            placeholder={calculatedCost.toString()}
            onChange={e => {
              const val = e.target.value
              setCustomPrice(val === '' ? null : Number(val))
            }}
          />
          {customPrice !== null && (
            <p className="text-sm text-gray-500 mt-1">Використовується вручну вказана вартість</p>
          )}
        </div>

        <div className="text-right font-semibold text-sm">
          Загальна вартість: <span className="text-primary">{totalCost} грн</span>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <button onClick={onClose} className="text-sm text-gray-500 hover:underline">Скасувати</button>
          <button onClick={handleSave} className="bg-primary text-white px-4 py-2 rounded hover:opacity-90">Зберегти</button>
        </div>
      </div>
    </div>
  )
}
