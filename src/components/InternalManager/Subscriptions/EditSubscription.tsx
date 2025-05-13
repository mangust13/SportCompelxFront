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

  useEffect(() => {
    axios.get<ActivityDto[]>('https://localhost:7270/api/Activities')
      .then(res => {
        setActivities(res.data)
        const mapped = subscription.activities.map(a => {
          const match = res.data.find(x => x.activityName === a.activityName)
          return match ? { activity: match, count: a.activityTypeAmount } : null
        }).filter(Boolean) as { activity: ActivityDto; count: number }[]
        setSelectedActivities(mapped)
      })
      .catch(err => console.error('Помилка завантаження активностей:', err))
  }, [subscription])

  const handleToggleActivity = (a: ActivityDto) => {
    setSelectedActivities(prev => {
      const exists = prev.find(p => p.activity.activityId === a.activityId)
      if (exists) return prev.filter(p => p.activity.activityId !== a.activityId)
      return [...prev, { activity: a, count: 5 }]
    })
  }

  const handleActivityChange = (id: number, field: 'count' | 'price', value: number) => {
    setSelectedActivities(prev =>
      prev.map(p =>
        p.activity.activityId === id
          ? field === 'count'
            ? { ...p, count: value }
            : { ...p, activity: { ...p.activity, activityPrice: value } }
          : p
      )
    )
  }

  const totalCost = selectedActivities.reduce(
    (sum, a) => sum + a.activity.activityPrice * a.count,
    0
  )

  const handleSave = async () => {
    try {
      await axios.put(
        `https://localhost:7270/api/Subscriptions/${subscription.subscriptionId}`,
        {
          subscriptionTotalCost: totalCost,
          subscriptionTerm: subscription.subscriptionTerm,
          subscriptionVisitTime: subscription.subscriptionVisitTime,
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

        {/* Термін (нередагований) */}
        <div>
          <label className="text-sm font-medium">Термін дії</label>
          <input
            type="text"
            value={subscription.subscriptionTerm}
            readOnly
            className="w-full border px-2 py-1 rounded mt-1 bg-gray-100 text-gray-500"
          />
        </div>

        {/* Час (нередагований) */}
        <div>
          <label className="text-sm font-medium">Час відвідування</label>
          <input
            type="text"
            value={subscription.subscriptionVisitTime}
            readOnly
            className="w-full border px-2 py-1 rounded mt-1 bg-gray-100 text-gray-500"
          />
        </div>

        {/* Активності */}
        <div>
          <p className="text-sm font-medium">Активності</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {activities.map(a => {
              const selected = selectedActivities.find(s => s.activity.activityId === a.activityId)
              return (
                <div key={a.activityId} className={`border p-3 rounded cursor-pointer ${selected ? 'bg-primary text-white' : 'bg-gray-100'}`} onClick={() => handleToggleActivity(a)}>
                  <p className="font-semibold">{a.activityName}</p>
                  {selected && (
                    <div className="mt-2 space-y-1 text-sm text-white">
                      <div className="flex gap-2 items-center">
                        <span>Кількість:</span>
                        <input
                          type="number"
                          value={selected.count}
                          onChange={e => handleActivityChange(a.activityId, 'count', Number(e.target.value))}
                          className="w-16 rounded px-1 text-black"
                        />
                      </div>
                      <div className="flex gap-2 items-center">
                        <span>Ціна:</span>
                        <input
                          type="number"
                          value={selected.activity.activityPrice}
                          onChange={e => handleActivityChange(a.activityId, 'price', Number(e.target.value))}
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

        {/* Вартість */}
        <div className="text-right font-semibold text-sm">
          Загальна вартість: <span className="text-primary">{totalCost} грн</span>
        </div>

        {/* Кнопки */}
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={onClose} className="text-sm text-gray-500 hover:underline">Скасувати</button>
          <button onClick={handleSave} className="bg-primary text-white px-4 py-2 rounded hover:opacity-90">Зберегти</button>
        </div>
      </div>
    </div>
  )
}
