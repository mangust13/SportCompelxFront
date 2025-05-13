import { AttendanceRecordDto } from './TrainerDtos'
import { highlightMatch } from '../../utils/highlightMatch'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getAuthHeaders } from '../../utils/authHeaders'
import axios from 'axios'

type Props = {
  attendance: AttendanceRecordDto
  search: string
  onEdit: () => void
  onDelete: (id: number) => void
}

export default function AttendanceCard({ attendance, search, onEdit, onDelete }: Props) {
  const handleDelete = () => {
    const toastId = toast.info(
      <div>
        Ви точно хочете видалити це відвідування клієнта <b>{attendance.clientFullName}</b>?
        <div className="flex gap-2 mt-2">
          <button
            onClick={async () => {
              try {
                await axios.delete(`https://localhost:7270/api/AttendanceRecord/${attendance.attendanceId}`, {headers: getAuthHeaders()})
                toast.success('Відвідування успішно видалено!')
                onDelete(attendance.attendanceId)
                toast.dismiss(toastId)
              } catch {
                toast.error('Помилка при видаленні')
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

  return (
    <div className="bg-white shadow-md rounded-xl p-3 flex flex-col gap-1 border border-gray-300">
      <div className="flex justify-between items-start text-sm text-gray-500">
        <span>{highlightMatch(`Покупка №${attendance.purchaseNumber}`, search)}</span>
        <div className="flex gap-1 text-sm">
          <button
            title="Редагувати"
            className="text-yellow-500 hover:text-yellow-600"
            onClick={onEdit}>
            ✏️
          </button>
          <button
            title="Видалити"
            className="text-red-500 hover:text-red-600"
            onClick={handleDelete}>
            🗑️
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-lg text-primary">
          {highlightMatch(attendance.subscriptionName, search)}
        </h3>
        <p className="text-sm text-gray-700">
          Термін: {highlightMatch(attendance.subscriptionTerm, search)} | Час: {highlightMatch(attendance.subscriptionVisitTime, search)}
        </p>
      </div>

      <div className="text-sm">
        <p className="font-semibold">Активності абонемента:</p>
        <p className="text-gray-700">
          {attendance.subscriptionActivities.map((a, i) => (
            <span key={i}>
              {i > 0 && ', '}
              {highlightMatch(a.activityName, search)}
            </span>
          ))}
        </p>
      </div>

      <div className="text-sm">
        <p><span className="font-semibold">Клієнт:</span> {highlightMatch(attendance.clientFullName, search)}</p>
      </div>

      <div className="text-sm">
        <p>
          <span className="font-semibold">Локація:</span> Зал №{attendance.gymNumber}, {highlightMatch(attendance.sportComplexAddress, search)}, {highlightMatch(attendance.sportComplexCity, search)}
        </p>
      </div>

      <div className="text-sm">
        <p><span className="font-semibold">Час проведення тренування:</span> {attendance.trainingStartTime}, {attendance.trainingEndTime}</p>
        <p><span className="font-semibold">Вид тренування:</span> {highlightMatch(attendance.trainingActivity, search)}</p>
      </div>

      <div className="text-sm">
        <p><span className="font-semibold">Дата та час відвідування:</span> {new Date(attendance.attendanceDateTime).toLocaleString()}</p>
      </div>
    </div>
  )
}
