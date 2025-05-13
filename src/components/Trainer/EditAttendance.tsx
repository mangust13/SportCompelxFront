import { useEffect, useState } from 'react'
import axios from 'axios'
import { AttendanceRecordDto } from './TrainerDtos'
import { getAuthHeaders } from '../../utils/authHeaders'
import { toast } from 'react-toastify'
import Select from 'react-select'

export type ActivityInGymOption = {
  activityInGymId: number
  activityName: string
  gymNumber: number
}

type Props = {
  attendance: AttendanceRecordDto
  onClose: () => void
  onSave: (updated: AttendanceRecordDto) => void
}

type OptionType = {
  value: number
  label: string
}

export default function EditAttendance({ attendance, onClose, onSave }: Props) {
  const [activityInGymId, setActivityInGymId] = useState<number | null>(null)
  const [availableOptions, setAvailableOptions] = useState<ActivityInGymOption[]>([])
  const [datetime, setDatetime] = useState<string>('')

  const activityOptions: OptionType[] = availableOptions.map(opt => ({
  value: opt.activityInGymId,
  label: `${opt.activityName} - Зал №${opt.gymNumber}`
}))

const selectedOption = activityOptions.find(opt => opt.value === activityInGymId) || null

  useEffect(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
    axios.get<ActivityInGymOption[]>(`https://localhost:7270/api/ConcreteTrainers/${user.trainerId}/activity-in-gyms`)
        .then(res => setAvailableOptions(res.data))
        .catch(() => toast.error('Помилка завантаження видів тренувань'))

    setDatetime(attendance.attendanceDateTime.slice(0, 16))
    }, [attendance])

useEffect(() => {
  if (availableOptions.length > 0 && activityInGymId === null) {
    const match = availableOptions.find(opt =>
      opt.activityName === attendance.trainingActivity &&
      opt.gymNumber === attendance.gymNumber
    )
    if (match) setActivityInGymId(match.activityInGymId)
  }
}, [availableOptions, attendance])


  const handleSave = async () => {
    if (!activityInGymId || !datetime) {
      toast.error('Заповніть усі поля')
      return
    }

    try {
      await axios.put('https://localhost:7270/api/AttendanceRecord/update', {
        attendanceId: attendance.attendanceId,
        activityInGymId,
        attendanceDateTime: datetime
      }, {
        headers: getAuthHeaders()
      })

      toast.success('Відвідування оновлено!')
      onSave({ ...attendance, attendanceDateTime: datetime })
      onClose()
    } catch {
      toast.error('Помилка при оновленні')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl p-6 w-[500px] flex flex-col gap-4">
        <h2 className="text-lg font-bold text-primary">Редагування відвідування</h2>

        <div>
            <p className="font-semibold mb-1">Вид тренування та зал:</p>
            <Select
                options={activityOptions}
                value={selectedOption}
                onChange={option => setActivityInGymId(option?.value ?? null)}
                placeholder="Оберіть активність"
                isClearable={false}
            />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Дата та час відвідування:</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={e => setDatetime(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="text-sm text-gray-500 hover:underline">Скасувати</button>
          <button onClick={handleSave} className="bg-primary text-white px-4 py-2 rounded hover:opacity-90">Зберегти</button>
        </div>
      </div>
    </div>
  )
}
