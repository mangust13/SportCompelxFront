import { AttendanceRecordDto } from '../../constants/types'

type Props = {
  attendance: AttendanceRecordDto
}

export default function AttendanceCard({ attendance }: Props) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 flex flex-col gap-2">
      {/* Верхній блок */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>Покупка №{attendance.purchaseNumber}</span>
        <span>{new Date(attendance.purchaseDate).toLocaleDateString()}</span>
      </div>

      {/* Підписка */}
      <div className="mt-2">
        <h3 className="font-bold text-lg text-primary">{attendance.subscriptionName}</h3>
        <p className="text-sm text-gray-700">
          Термін: {attendance.subscriptionTerm} | Час: {attendance.subscriptionVisitTime}
        </p>
      </div>

      {/* Тренер та активність */}
      <div className="mt-2 text-sm">
        <p><span className="font-semibold">Тренер:</span> {attendance.trainerName}</p>
        <p><span className="font-semibold">Активність:</span> {attendance.activityName}</p>
      </div>

      {/* Зал та спорткомплекс */}
      <div className="mt-2 text-sm">
        <p><span className="font-semibold">Зал:</span> {attendance.gymNumber}</p>
        <p><span className="font-semibold">Спорткомплекс:</span> {attendance.sportComplexAddress}</p>
      </div>
    </div>
  )
}
