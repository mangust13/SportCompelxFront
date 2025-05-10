import axios from 'axios'
import { useState, useRef, useEffect } from 'react'
import TimePicker from 'react-time-picker'
import 'react-time-picker/dist/TimePicker.css'
import { toast } from 'react-toastify'
import { highlightMatch } from '../../../utils/highlightMatch'
import { TrainerFullScheduleDto, TrainerScheduleEntryDto } from '../InternalDtos'
import { dayOrder } from '../../../utils/types'

type Props = {
  trainer: TrainerFullScheduleDto
  search: string
  onDelete: (id: number) => void
  onUpdate: (updatedTrainer: TrainerFullScheduleDto) => void
}

type ActivityDto = {
  activityId: number
  activityName: string
}

export default function TrainerCard({ trainer, search, onDelete, onUpdate }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [activities, setActivities] = useState<ActivityDto[]>([])
  const [selectedDay, setSelectedDay] = useState('')
  const [activityId, setActivityId] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<string | null>('10:00')
  const [endTime, setEndTime] = useState<string | null>('12:00')

  

  const groupedByDay = dayOrder.map(day => ({
    day,
    entries: trainer.schedule
      .filter(e => e.dayName === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }))

  const isWeekend = selectedDay === 'Субота' || selectedDay === 'Неділя'
  const minTime = isWeekend ? '11:00' : '10:00'
  const maxTime = isWeekend ? '17:00' : '22:00'

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

  useEffect(() => {
    axios.get<ActivityDto[]>(`https://localhost:7270/api/Trainers/trainer/${trainer.trainerId}`)
      .then(res => {
        setActivities(res.data)
        if (res.data.length > 0 && activityId === null) {
          setActivityId(res.data[0].activityId)
        }
      })
      .catch(err => console.error('Помилка завантаження активностей:', err))

    if (!selectedDay) {
      setSelectedDay(dayOrder[0])
    }
  }, [trainer.trainerId])

  const handleToggleExpand = () => {
    setIsExpanded(prev => !prev)
  }

  const handleAddSchedule = async () => {
    if (!selectedDay || !activityId || !startTime || !endTime) {
      toast.error('Будь ласка, заповніть всі поля.')
      return
    }

    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    const duration = endMinutes - startMinutes

    if (duration < 30) {
      toast.error('Тривалість мінімум 30 хв.')
      return
    }
    if (duration > 120) {
      toast.error('Тривалість не більше 2 год.')
      return
    }
    if (startMinutes < (isWeekend ? 11 * 60 : 10 * 60) || endMinutes > (isWeekend ? 17 * 60 : 22 * 60)) {
      toast.error(`Час має бути між ${minTime}–${maxTime}`)
      return
    }

    const overlap = trainer.schedule.some(entry =>
      entry.dayName === selectedDay &&
      !(endTime <= entry.startTime || startTime >= entry.endTime)
    )

    if (overlap) {
      toast.error('У цей час тренер вже зайнятий.')
      return
    }

    try {
      const response = await axios.post('https://localhost:7270/api/Trainers/TrainerSchedules', {
        trainerId: trainer.trainerId,
        dayName: selectedDay,
        activityId,
        startTime,
        endTime
      })

      const newScheduleId = response.data.scheduleId

      toast.success('Запис додано!')

      const updatedSchedule: TrainerScheduleEntryDto = {
        scheduleId: newScheduleId,
        dayName: selectedDay,
        activityName: activities.find(a => a.activityId === activityId)?.activityName || '',
        startTime,
        endTime
      }

      const updatedTrainer = {
        ...trainer,
        schedule: [...trainer.schedule, updatedSchedule]
      }

      onUpdate(updatedTrainer)
      setStartTime(minTime)
      setEndTime(minTime)
    } catch (error) {
      toast.error('Помилка при додаванні запису.')
    }
  }

  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      await axios.delete(`https://localhost:7270/api/Trainers/TrainerSchedules/${scheduleId}`)
      toast.success('Запис видалено!')
      const updatedTrainer = {
        ...trainer,
        schedule: trainer.schedule.filter(s => s.scheduleId !== scheduleId)
      }
      onUpdate(updatedTrainer)
    } catch (error) {
      toast.error('Помилка при видаленні запису.')
    }
  }

  return (
    <div className="bg-white shadow rounded p-4 flex flex-col gap-2 relative">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg text-primary">{highlightMatch(trainer.trainerFullName, search)}</h3>
        <div className="flex gap-2">
          <button title="Редагувати" className="text-yellow-500 hover:text-yellow-600">✏️</button>
          <button title="Видалити" className="text-red-500 hover:text-red-600" onClick={() => onDelete(trainer.trainerId)}>🗑️</button>
        </div>
      </div>

      <p className="text-sm text-gray-700">📞 {highlightMatch(trainer.trainerPhoneNumber, search)}</p>
      <p className="text-sm text-gray-700">👤 {highlightMatch(trainer.trainerGender, search)}</p>
      <p className="text-sm text-gray-700">
        🏠 <span className="font-semibold">Адреса:</span> {highlightMatch(trainer.trainerAddress, search)}, {highlightMatch(trainer.trainerCity, search)}
      </p>

      <button onClick={handleToggleExpand} className="text-blue-500 hover:underline text-sm mt-2 self-start">
        {isExpanded ? 'Сховати графік' : 'Показати графік'}
      </button>

      <div ref={contentRef} className="expandable-content overflow-hidden transition-all duration-300 ease-in-out">
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm border mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-1">День</th>
                <th className="border p-1">Активність</th>
                <th className="border p-1">Початок</th>
                <th className="border p-1">Кінець</th>
                <th className="border p-1">Дії</th>
              </tr>
            </thead>
            <tbody>
              {groupedByDay.map((group, idx) =>
                group.entries.length > 0 && group.entries.map((entry, i) => (
                  <tr key={`${idx}-${i}`} className="text-center">
                    <td className="border p-1">{i === 0 ? group.day : ''}</td>
                    <td className="border p-1">{entry.activityName}</td>
                    <td className="border p-1">{entry.startTime}</td>
                    <td className="border p-1">{entry.endTime}</td>
                    <td className="border p-1 flex justify-center gap-1">
                      <button title="Редагувати" className="text-yellow-500 hover:text-yellow-600 text-sm">✏️</button>
                      <button
                        title="Видалити"
                        className="text-red-500 hover:text-red-600 text-sm"
                        onClick={() => handleDeleteSchedule(entry.scheduleId)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex flex-wrap gap-2 items-center">
            <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="border rounded px-2 py-1 text-sm">
              {dayOrder.map(day => <option key={day} value={day}>{day}</option>)}
            </select>

            <select value={activityId || ''} onChange={(e) => setActivityId(Number(e.target.value))} className="border rounded px-2 py-1 text-sm">
              {activities.map(a => (
                <option key={a.activityId} value={a.activityId}>{a.activityName}</option>
              ))}
            </select>

            <div className="flex gap-2 items-center">
              <TimePicker onChange={setStartTime} value={startTime} disableClock format="HH:mm" />
              <TimePicker onChange={setEndTime} value={endTime} disableClock format="HH:mm" />
            </div>

            <button onClick={handleAddSchedule} className="bg-green-500 text-white pl-3 px-2 py-1 rounded text-sm ml-2">
              Додати запис
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
