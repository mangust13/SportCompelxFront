import { useState, useEffect } from 'react'
import Select from 'react-select'
import axios from 'axios'

type Props = {
  onClose: () => void
  onSuccess: (attendance: any) => void
}

type ClientOption = {
  value: number
  label: string
}

type Purchase = {
  purchaseId: number
  purchaseNumber: number
  subscriptionName: string
  activities: { activityId: number; activityName: string; activityTypeAmount: number }[]
  totalAttendances: number
  subscriptionTerm: string
  purchaseDate: string
}

type ActivityOption = {
  activityId: number
  activityName: string
}

type GymOption = {
  gymNumber: number
  gymInfo: string
}

type ScheduleOption = {
  scheduleId: number
  dayName: string
  startTime: string
  endTime: string
  activityName: string
  activityId: number
  gymNumber: number
}


export default function AddAttendance({ onClose, onSuccess }: Props) {
  const [clients, setClients] = useState<ClientOption[]>([])
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)

  const [allPurchases, setAllPurchases] = useState<Purchase[]>([])
  const [activePurchases, setActivePurchases] = useState<Purchase[]>([])
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null)

  const [trainerActivities, setTrainerActivities] = useState<ActivityOption[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityOption[]>([])
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null)

  const [gyms, setGyms] = useState<GymOption[]>([])
  const [selectedGymNumber, setSelectedGymNumber] = useState<number | null>(null)

  const [allSchedules, setAllSchedules] = useState<ScheduleOption[]>([])
  const [filteredSchedules, setFilteredSchedules] = useState<ScheduleOption[]>([])
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const trainerId = user.trainerId

    axios.get('https://localhost:7270/api/Clients')
      .then(res => {
        const options = res.data.map((c: any) => ({
          value: c.clientId,
          label: `${c.clientFullName} (${c.clientPhoneNumber} • ${c.clientGender})`
        }))
        setClients(options)
      })
      .catch(err => console.error('Помилка завантаження клієнтів:', err))

    axios.get(`https://localhost:7270/api/Trainers/${trainerId}/activities`)
      .then(res => setTrainerActivities(res.data))
      .catch(err => console.error('Помилка завантаження активностей тренера:', err))

    axios.get(`https://localhost:7270/api/Trainers/${trainerId}/schedules`)
      .then(res => setAllSchedules(res.data))
      .catch(err => console.error('Помилка завантаження розкладу:', err))
  }, [])

  useEffect(() => {
    if (selectedClientId) {
      axios.get(`https://localhost:7270/api/Clients/${selectedClientId}/purchases`)
        .then(res => {
          const active = res.data.filter((p: Purchase) => {
            const totalTrainings = p.activities.reduce((sum, a) => sum + a.activityTypeAmount, 0)
            const trainingsLeft = totalTrainings - p.totalAttendances
            const termMonths = parseInt(p.subscriptionTerm.replace(/\D/g, ''), 10) || 0
            const expirationDate = new Date(p.purchaseDate)
            expirationDate.setMonth(expirationDate.getMonth() + termMonths)
            const isExpired = new Date() > expirationDate
            return !isExpired && trainingsLeft > 0
          })
          setAllPurchases(res.data)
          setActivePurchases(active)
        })
        .catch(err => console.error('Помилка завантаження покупок:', err))
    } else {
      setAllPurchases([])
      setActivePurchases([])
    }
  }, [selectedClientId])

  useEffect(() => {
    if (selectedPurchaseId) {
      const purchase = allPurchases.find(p => p.purchaseId === selectedPurchaseId)
      if (purchase) {
        const intersected = purchase.activities.filter(a =>
          trainerActivities.some(t => t.activityId === a.activityId)
        )
        setFilteredActivities(intersected)
      }
    } else {
      setFilteredActivities([])
    }
  }, [selectedPurchaseId, trainerActivities])

  useEffect(() => {
    if (selectedActivityId) {
      axios.get(`https://localhost:7270/api/Activities/${selectedActivityId}/gyms`)
        .then(res => setGyms(res.data))
        .catch(err => console.error('Помилка завантаження залів:', err))
    } else {
      setGyms([])
    }
  }, [selectedActivityId])

  useEffect(() => {
    if (selectedActivityId && selectedGymNumber) {
      const filtered = allSchedules.filter(s =>
        s.activityId === selectedActivityId && s.gymNumber === selectedGymNumber
      )
      setFilteredSchedules(filtered)
    } else {
      setFilteredSchedules([])
    }
  }, [selectedActivityId, selectedGymNumber, allSchedules])

  const handleSave = () => {
    if (selectedClientId && selectedPurchaseId && selectedActivityId && selectedGymNumber && selectedScheduleId) {
      onSuccess({
        clientId: selectedClientId,
        purchaseId: selectedPurchaseId,
        activityId: selectedActivityId,
        gymNumber: selectedGymNumber,
        scheduleId: selectedScheduleId
      })
      onClose()
    } else {
      alert('Будь ласка, заповніть усі поля.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold mb-2">Додати відвідування</h2>

        {/* Клієнт */}
        <div>
          <p className="font-semibold mb-1">Клієнт:</p>
          <Select
            options={clients}
            onChange={(selected) => setSelectedClientId(selected?.value || null)}
            placeholder="Оберіть клієнта..."
            isClearable
          />
        </div>

        {/* Покупка */}
        <div>
          <p className="font-semibold mb-1">Активна покупка:</p>
          <select
            value={selectedPurchaseId ?? ''}
            onChange={(e) => setSelectedPurchaseId(Number(e.target.value))}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Оберіть покупку</option>
            {activePurchases.map(p => (
              <option key={p.purchaseId} value={p.purchaseId}>
                №{p.purchaseNumber} - {p.subscriptionName}
              </option>
            ))}
          </select>
        </div>

        {/* Активність */}
        <div>
          <p className="font-semibold mb-1">Вид тренування:</p>
          <select
            value={selectedActivityId ?? ''}
            onChange={(e) => setSelectedActivityId(Number(e.target.value))}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Оберіть активність</option>
            {filteredActivities.map(a => (
              <option key={a.activityId} value={a.activityId}>{a.activityName}</option>
            ))}
          </select>
        </div>

        {/* Зал */}
        <div>
          <p className="font-semibold mb-1">Зал:</p>
          <select
            value={selectedGymNumber ?? ''}
            onChange={(e) => setSelectedGymNumber(Number(e.target.value))}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Оберіть зал</option>
            {gyms.map(g => (
              <option key={g.gymNumber} value={g.gymNumber}>{g.gymInfo}</option>
            ))}
          </select>
        </div>

        {/* Розклад */}
        <div>
          <p className="font-semibold mb-1">Час тренування:</p>
          <select
            value={selectedScheduleId ?? ''}
            onChange={(e) => setSelectedScheduleId(Number(e.target.value))}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Оберіть час</option>
            {filteredSchedules.map(s => (
              <option key={s.scheduleId} value={s.scheduleId}>
                {s.dayName}: {s.startTime} - {s.endTime}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Скасувати
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-primary text-white hover:opacity-90"
          >
            Зберегти
          </button>
        </div>
      </div>
    </div>
  )
}
