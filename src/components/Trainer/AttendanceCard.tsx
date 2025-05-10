import { AttendanceRecordDto } from './TrainerDtos'
import { highlightMatch } from '../../utils/highlightMatch'

type Props = {
  attendance: AttendanceRecordDto
  search: string
}

export default function AttendanceCard({ attendance, search }: Props) {
  return (
    <div className="bg-white shadow-md rounded-xl p-3 flex flex-col gap-1 border border-gray-300">
      <div className="flex justify-between items-start text-sm text-gray-500">
        <span>{highlightMatch(`Покупка №${attendance.purchaseNumber}`, search)}</span>
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
