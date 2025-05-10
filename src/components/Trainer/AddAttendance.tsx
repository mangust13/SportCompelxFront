import { useEffect, useState } from 'react'
import Select from 'react-select'
import axios from 'axios'
import { Schedule, ClientOption } from './TrainerDtos'
import { toast } from 'react-toastify'

type Props = {
  schedule: Schedule
  onClose: () => void
  onSuccess: (attendance: any) => void
}

export default function AddAttendance({ schedule, onClose, onSuccess }: Props) {
  const [clients, setClients] = useState<ClientOption[]>([])
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null)
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null)

  useEffect(() => {
    const activityId = schedule.activityId
    if (!activityId) return

    fetch(`https://localhost:7270/api/ConcreteTrainers/eligible-clients?activityId=${activityId}`)
      .then(res => res.json())
      .then(data => setClients(data.map((c: any) => ({
        value: c.clientId,
        label: `${c.clientFullName} (${c.clientPhoneNumber} • ${c.clientGender})`,
        purchases: c.purchases || []
      }))))
      .catch(console.error)
  }, [schedule.activityId])

  const handleSave = async () => {
    if (!selectedClient || !selectedPurchaseId) {
      toast.error('Оберіть клієнта і покупку.')
      return
    }

    try {
      await axios.post('https://localhost:7270/api/ConcreteTrainers/add-attendance', {
        trainerScheduleId: schedule.trainerScheduleId,
        purchaseId: selectedPurchaseId,
        clientId: selectedClient.value
      })
      toast.success('Відвідування успішно додано!')
      onSuccess({ purchaseId: selectedPurchaseId, scheduleId: schedule.scheduleId })
      onClose()
    } catch {
      toast.error('Не вдалося додати відвідування.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold mb-2">Додати відвідування</h2>

        <div>
          <p className="font-semibold mb-1">Клієнт:</p>
          <Select
            options={clients}
            onChange={option => {
              setSelectedClient(option as ClientOption)
              setSelectedPurchaseId(null)
            }}
            placeholder="Оберіть клієнта..."
            isClearable
          />
        </div>

        {selectedClient && selectedClient?.purchases?.length > 0 && (
          <div>
            <p className="font-semibold mb-1">Покупка:</p>
            <select
              value={selectedPurchaseId ?? ''}
              onChange={e => setSelectedPurchaseId(Number(e.target.value))}
              className="border rounded px-2 py-1 w-full"
            >
              <option value="">Оберіть покупку</option>
              {selectedClient?.purchases?.map(p => (
                <option key={p.purchaseId} value={p.purchaseId}>
                  №{p.purchaseNumber} - {p.subscriptionName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="text-sm text-gray-700 space-y-1 bg-gray-50 p-2 rounded">
          <p><b>День:</b> {schedule.dayName}</p>
          <p><b>Час:</b> {schedule.startTime} - {schedule.endTime}</p>
          <p><b>Активність:</b> {schedule.activityName}</p>
          <p><b>Зал:</b> №{schedule.gymNumber}</p>
          <p><b>Адреса:</b> {schedule.sportComplexAddress}, {schedule.sportComplexCity}</p>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">
            Скасувати
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-primary text-white hover:opacity-90">
            Зберегти
          </button>
        </div>
      </div>
    </div>
  )
}
