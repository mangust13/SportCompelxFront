import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { TrainerScheduleEntryDto, ActivityDto } from '../InternalDtos'
import axios from 'axios'
import { getAuthHeaders } from '../../../utils/authHeaders'
import { dayOrder } from '../../../utils/types'
import TimePicker from 'react-time-picker'
import 'react-time-picker/dist/TimePicker.css'

type EditScheduleModalProps = {
  schedule: TrainerScheduleEntryDto
  activities: ActivityDto[]
  onClose: () => void
  onSave: (updated: TrainerScheduleEntryDto) => void
}

export default function EditSchedule({ schedule, activities, onClose, onSave }: EditScheduleModalProps) {
  const [day, setDay] = useState(schedule.dayName)
  const [activityId, setActivityId] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<string>('10:00')
const [endTime, setEndTime] = useState<string>('12:00')


  useEffect(() => {
    const found = activities.find(a => a.activityName === schedule.activityName)
    if (found) setActivityId(found.activityId)
  }, [schedule, activities])

  const handleSave = async () => {
    try {
        await axios.put(`https://localhost:7270/api/Trainers/TrainerSchedules/${schedule.scheduleId}`, {
        dayName: day,
        activityId,
        startTime,
        endTime
      }, { headers: getAuthHeaders() })

      toast.success('Розклад оновлено!')
      onSave({
        ...schedule,
        dayName: day,
        activityName: activities.find(a => a.activityId === activityId)?.activityName || '',
        startTime,
        endTime
      })
    } catch {
      toast.error('Помилка при оновленні розкладу.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[400px] flex flex-col gap-4">
        <h2 className="text-lg font-bold text-primary">Редагування розкладу</h2>

        <select value={day} onChange={e => setDay(e.target.value)} className="border px-2 py-1 rounded">
          {dayOrder.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select value={activityId ?? ''} onChange={e => setActivityId(Number(e.target.value))} className="border px-2 py-1 rounded">
          {activities.map(a => <option key={a.activityId} value={a.activityId}>{a.activityName}</option>)}
        </select>

        <div className="flex gap-2">
          <TimePicker
                onChange={(val) => setStartTime(val ?? '10:00')}
                value={startTime}
                disableClock
                format="HH:mm"
            />
            <TimePicker
                onChange={(val) => setEndTime(val ?? '12:00')}
                value={endTime}
                disableClock
                format="HH:mm"
            />
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm text-gray-600 hover:underline">Скасувати</button>
          <button onClick={handleSave} className="bg-primary text-white px-4 py-2 rounded">Зберегти</button>
        </div>
      </div>
    </div>
  )
}
