import { useEffect, useState } from 'react'
import axios from 'axios'
import { AttendanceRecordDto } from '../../constants/types'
import AttendanceCard from './AttendanceCard'

export default function AttendanceList() {
  const [attendances, setAttendances] = useState<AttendanceRecordDto[]>([])

  useEffect(() => {
    axios
      .get('https://localhost:7270/api/attendanceRecord/attendance-record-view')
      .then(res => setAttendances(res.data))
      .catch(err => console.error('Помилка завантаження:', err))
  }, [])

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {attendances.map((attendance, idx) => (
        <AttendanceCard key={idx} attendance={attendance} />
      ))}
    </div>
  )
}
