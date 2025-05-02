import { useEffect, useState } from 'react'
import { SubscriptionDto } from '../../../constants/types'
import axios from 'axios'
import { toast } from 'react-toastify'

type ActivityDto = {
  activityId: number
  activityName: string
  activityPrice: number
  activityDescription: string
}

const TERMS = [
  { label: '1 місяць', value: '1 місяць', multiplier: 1 },
  { label: '3 місяці', value: '3 місяці', multiplier: 3 },
  { label: '6 місяців', value: '6 місяців', multiplier: 6 },
  { label: '1 рік', value: '1 рік', multiplier: 12 },
]

const VISIT_TIMES = ['Ранковий', 'Вечірний', 'Безлімітний']

type Props = {
  onClose: () => void
  onSuccess: () => void
}

export default function AddSubscriptionModal({ onClose, onSuccess }: Props) {
  const [term, setTerm] = useState(TERMS[0].value)
  const [visitTime, setVisitTime] = useState(VISIT_TIMES[0])
  const [activities, setActivities] = useState<ActivityDto[]>([])
  const [selectedActivities, setSelectedActivities] = useState<{ activity: ActivityDto; count: number }[]>([])

  const [newActivityName, setNewActivityName] = useState('')
  const [newActivityPrice, setNewActivityPrice] = useState(0)
  const [newActivityDescription, setNewActivityDescription] = useState('')

  const [editingActivityId, setEditingActivityId] = useState<number | null>(null)
  const [editingFields, setEditingFields] = useState<{ name: string, price: number, desc: string }>({ name: '', price: 0, desc: '' })

  const [isAddOpen, setIsAddOpen] = useState(false)

  useEffect(() => {
    axios.get<ActivityDto[]>('https://localhost:7270/api/Activities')
      .then(res => setActivities(res.data))
      .catch(err => console.error('Помилка завантаження активностей:', err))
  }, [])

  const getLimits = () => {
    switch (term) {
      case '1 місяць': return { min: 5, max: 8 }
      case '3 місяці': return { min: 15, max: 24 }
      case '6 місяців': return { min: 30, max: 48 }
      case '1 рік': return { min: 60, max: 96 }
      default: return { min: 5, max: 8 }
    }
  }

  const handleActivityToggle = (activity: ActivityDto) => {
    const exists = selectedActivities.find(a => a.activity.activityId === activity.activityId)
    if (exists) {
      setSelectedActivities(prev => prev.filter(a => a.activity.activityId !== activity.activityId))
    } else {
      setSelectedActivities(prev => [...prev, { activity, count: getLimits().min }])
    }
  }

  const handleActivityChange = (activityId: number, field: 'count' | 'price', value: number) => {
    setSelectedActivities(prev =>
      prev.map(a =>
        a.activity.activityId === activityId
          ? field === 'count'
            ? { ...a, count: value }
            : { ...a, activity: { ...a.activity, activityPrice: value } }
          : a
      )
    )
  }

  const handleAddNewActivity = async () => {
    try {
      const response = await axios.post<ActivityDto>('https://localhost:7270/api/Activities', {
        activityName: newActivityName.trim(),
        activityPrice: newActivityPrice,
        activityDescription: newActivityDescription.trim()
      })

      const newActivity = response.data

      setActivities(prev => [...prev, newActivity])
      setSelectedActivities(prev => [...prev, { activity: newActivity, count: getLimits().min }])

      setNewActivityName('')
      setNewActivityPrice(0)
      setNewActivityDescription('')

      toast.success('Активність успішно додана!')
    } catch (error) {
      toast.error('Помилка при додаванні активності.')
    }
  }

  const startEditActivity = (activity: ActivityDto) => {
    setEditingActivityId(activity.activityId)
    setEditingFields({
      name: activity.activityName,
      price: activity.activityPrice,
      desc: activity.activityDescription ?? ''
    })
  }

  const handleUpdateActivity = async () => {
    try {
      await axios.put(`https://localhost:7270/api/Activities/${editingActivityId}`, {
        activityName: editingFields.name,
        activityPrice: editingFields.price,
        activityDescription: editingFields.desc
      })

      setActivities(prev =>
        prev.map(a =>
          a.activityId === editingActivityId
            ? { ...a, activityName: editingFields.name, activityPrice: editingFields.price, activityDescription: editingFields.desc }
            : a
        )
      )

      setEditingActivityId(null)
      setEditingFields({ name: '', price: 0, desc: '' })
      toast.success('Активність оновлена!')
    } catch (err) {
      toast.error('Помилка оновлення активності.')
    }
  }

  const handleDeleteActivity = async (id: number) => {
    const toastId = toast.info(
      <div>
        Ви точно хочете видалити активність?
        <div className="flex gap-2 mt-2">
          <button
            onClick={async () => {
              try {
                await axios.delete(`https://localhost:7270/api/Activities/${id}`)
                setActivities(prev => prev.filter(a => a.activityId !== id))
                setSelectedActivities(prev => prev.filter(a => a.activity.activityId !== id))
                toast.success('Активність видалена!')
                toast.dismiss(toastId)
              } catch {
                toast.error('Помилка видалення активності.')
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
  

  const totalCost = selectedActivities.reduce(
    (sum, a) => sum + a.activity.activityPrice * a.count,
    0
  )

  const handleSave = async () => {
    const newSub: SubscriptionDto = {
      subscriptionId: 0,
      subscriptionName: '',
      subscriptionTotalCost: totalCost,
      subscriptionTerm: term,
      subscriptionVisitTime: visitTime,
      activities: selectedActivities.map(a => ({
        activityName: a.activity.activityName,
        activityPrice: a.activity.activityPrice,
        activityDescription: a.activity.activityDescription,
        activityTypeAmount: a.count
      }))
    }

    try {
      await axios.post('https://localhost:7270/api/Subscriptions', newSub)
      toast.success('Абонемент успішно створено!')
      onSuccess()
    } catch (error) {
      toast.error('Помилка при створенні абонемента.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[500px] flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-primary">Новий абонемент</h2>

        {/* Вибір терміну */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Термін дії</label>
          <select
            className="border px-3 py-2 rounded"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          >
            {TERMS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Вибір часу відвідувань */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Час відвідування</label>
          <select
            className="border px-3 py-2 rounded"
            value={visitTime}
            onChange={(e) => setVisitTime(e.target.value)}
          >
            {VISIT_TIMES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Види активностей */}
<div className="flex flex-col gap-2">
  <p className="text-sm font-medium">Види активностей</p>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
    {activities.map(a => {
      const selected = selectedActivities.find(s => s.activity.activityId === a.activityId)
      const { min, max } = getLimits()
      const isInvalid = selected && (selected.count < min || selected.count > max)

      return (
        <div
          key={a.activityId}
          className={`border rounded p-3 text-sm space-y-1 transition cursor-pointer ${
            selected ? 'bg-primary/75 text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={() => handleActivityToggle(a)}
        >
          <div className="flex justify-between items-start">
            {editingActivityId === a.activityId ? (
              <div className="flex flex-col gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                <input
                  className="border px-2 py-1 text-sm text-black"
                  value={editingFields.name}
                  onChange={(e) => setEditingFields({ ...editingFields, name: e.target.value })}
                />
                <input
                  type="number"
                  className="border px-2 py-1 text-sm text-black"
                  value={editingFields.price}
                  onChange={(e) => setEditingFields({ ...editingFields, price: Number(e.target.value) })}
                />
                <textarea
                  className="border px-2 py-1 text-sm text-black resize-none"
                  value={editingFields.desc}
                  onChange={(e) => setEditingFields({ ...editingFields, desc: e.target.value })}
                />
                <div className="flex gap-2">
                  <button onClick={handleUpdateActivity} className="text-xs text-green-600 hover:underline">Зберегти</button>
                  <button onClick={() => setEditingActivityId(null)} className="text-xs text-gray-500 hover:underline">Скасувати</button>
                </div>
              </div>
            ) : (
              <>
                <p className="font-semibold">{a.activityName}</p>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => startEditActivity(a)}>✏️</button>
                  <button onClick={() => handleDeleteActivity(a.activityId)}>🗑️</button>
                </div>
              </>
            )}
          </div>

          {selected && !editingActivityId && (
            <div className="space-y-1 mt-1" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs">Кількість занять:</span>
                  <input
                    type="number"
                    min={1}
                    value={selected.count === 0 ? '' : selected.count}
                    onChange={(e) => {
                      const val = e.target.value
                      const number = val === '' ? 0 : Number(val)
                      handleActivityChange(a.activityId, 'count', number)
                    }}
                    className="w-20 px-1 py-0.5 rounded border text-black text-sm"
                  />
                </div>
                {isInvalid && (
                  <p className="text-sm font-semibold text-red-600">
                    Кількість має бути між {min} і {max}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs">Ціна:</span>
                <input
                  type="number"
                  min={0}
                  value={selected.activity.activityPrice}
                  onChange={(e) =>
                    handleActivityChange(a.activityId, 'price', Number(e.target.value))
                  }
                  className="w-20 px-1 py-0.5 rounded border text-black text-xs"
                />
                <span className="text-xs">грн</span>
              </div>
            </div>
          )}
        </div>
      )
    })}
  </div>

  {/* Розкривна форма додавання нової активності */}
  <div className="mt-4 border-t pt-4">
    {!isAddOpen ? (
      <button
        onClick={() => setIsAddOpen(true)}
        className="text-sm text-primary font-medium"
      >
        ➕ Додати нову активність
      </button>
    ) : (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <p className="text-sm font-bold text-primary">Нова активність</p>
          <button
            onClick={() => setIsAddOpen(false)}
            className="text-sm text-gray-500 hover:underline"
          >
            Скасувати
          </button>
        </div>

        <input
          type="text"
          placeholder="Назва активності"
          value={newActivityName}
          onChange={(e) => setNewActivityName(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />

        <input
          type="number"
          placeholder="Ціна за тренування (грн)"
          value={newActivityPrice === 0 ? '' : newActivityPrice}
          onChange={(e) => {
            const val = e.target.value
            setNewActivityPrice(val === '' ? 0 : Number(val))
          }}
          className="border rounded px-3 py-2 text-sm"
        />

        <textarea
          placeholder="Опис активності (необов'язково)"
          value={newActivityDescription}
          onChange={(e) => setNewActivityDescription(e.target.value)}
          className="border rounded px-3 py-2 text-sm resize-none"
        />

        <button
          onClick={handleAddNewActivity}
          disabled={!newActivityName.trim() || newActivityPrice <= 0}
          className="mt-2 bg-primary text-white py-2 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Додати активність
        </button>
      </div>
    )}
  </div>
</div>


        {/* Вартість */}
        <div className="text-right text-sm font-medium mt-4">
          Загальна вартість: <span className="text-primary">{totalCost} грн</span>
        </div>

        {/* Кнопки */}
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={onClose} className="text-gray-500 hover:underline">
            Скасувати
          </button>
          <button
            onClick={handleSave}
            className="bg-primary text-white px-4 py-2 rounded hover:opacity-90"
          >
            Зберегти
          </button>
        </div>
      </div>
    </div>
  )
}
