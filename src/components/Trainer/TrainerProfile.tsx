import { useEffect, useState } from 'react'
import axios from 'axios'

type Activity = {
  activityId: number
  activityName: string
}

type Schedule = {
  scheduleId: number
  dayName: string
  startTime: string
  endTime: string
  activityName: string
  gymNumber: number
  sportComplexAddress: string
  sportComplexCity: string
}

type TrainerProfile = {
  trainerFullName: string
  activities: Activity[]
  schedules: Schedule[]
}

export default function TrainerProfilePage() {
  const [profile, setProfile] = useState<TrainerProfile | null>(null)

  const dayOrder = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'Пʼятниця', 'Субота', 'Неділя']

  const groupedByDay = dayOrder.map(day => ({
    day,
    entries: profile?.schedules
      .filter(e => e.dayName === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)) || []
  }))

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const trainerId = user.trainerId

    axios.get(`https://localhost:7270/api/ConcreteTrainers/${trainerId}/profile`)
      .then(res => setProfile(res.data))
      .catch(err => console.error('Помилка завантаження профілю тренера:', err))
  }, [])

  if (!profile) return <p>Завантаження...</p>

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto p-4">
      {/* Про мене */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2 text-primary">Про мене</h2>
        <p className="text-sm text-gray-700 mb-2">
          🏠 Адреса: {profile.schedules[0]?.sportComplexAddress || '-'}, {profile.schedules[0]?.sportComplexCity || '-'}
        </p>
        <p className="text-sm text-gray-700 mb-2">
          🏋️ Спеціалізації: {profile.activities.length > 0
            ? profile.activities.map(a => a.activityName).join(', ')
            : 'Немає спеціалізацій'}
        </p>
      </div>

      {/* Розклад */}
      <div className="bg-white shadow rounded-xl p-4 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-2 text-primary">Розклад</h2>
        {profile.schedules.length > 0 ? (
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-1">День</th>
                <th className="border p-1">Активність</th>
                <th className="border p-1">Зал</th>
                <th className="border p-1">Початок</th>
                <th className="border p-1">Кінець</th>
              </tr>
            </thead>
            <tbody>
              {groupedByDay.map((group, idx) =>
                group.entries.length > 0 &&
                group.entries.map((entry, i) => (
                  <tr key={`${idx}-${i}`}>
                    <td className="border p-1 text-center">{i === 0 ? group.day : ''}</td>
                    <td className="border p-1 text-center">{entry.activityName}</td>
                    <td className="border p-1 text-center">№{entry.gymNumber}</td>
                    <td className="border p-1 text-center">{entry.startTime}</td>
                    <td className="border p-1 text-center">{entry.endTime}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">Розклад відсутній.</p>
        )}
      </div>
    </div>
  )
}
