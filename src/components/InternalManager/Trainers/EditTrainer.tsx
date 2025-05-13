import { useState, useEffect } from 'react'
import axios from 'axios'
import { TrainerFullScheduleDto } from '../InternalDtos'
import { toast } from 'react-toastify'
import { SportComplexDto } from '../InternalDtos'
import { getAuthHeaders } from '../../../utils/authHeaders'

type Props = {
  trainer: TrainerFullScheduleDto
  onClose: () => void
  onSave: (updated: TrainerFullScheduleDto) => void
}

export default function EditTrainer({ trainer, onClose, onSave }: Props) {
  const [fullName, setFullName] = useState(trainer.trainerFullName)
  const [phoneNumber, setPhoneNumber] = useState(trainer.trainerPhoneNumber)
  const [gender, setGender] = useState(trainer.trainerGender)

  const [sportComplexes, setSportComplexes] = useState<SportComplexDto[]>([])
  const [selectedComplexId, setSelectedComplexId] = useState<number | null>(null)

  useEffect(() => {
    axios.get<SportComplexDto[]>('https://localhost:7270/api/SportComplexes/all')
      .then(res => {
        setSportComplexes(res.data)
        const match = res.data.find(
          sc => sc.city === trainer.trainerCity && sc.address === trainer.trainerAddress
        )
        if (match) setSelectedComplexId(match.sportComplexId)
      })
      .catch(() => toast.error('Помилка завантаження спорткомплексів'))
  }, [trainer])

  const handleSave = async () => {
    if (!fullName.trim() || !phoneNumber.trim() || !selectedComplexId) {
      toast.error('Заповніть всі поля')
      return
    }

    try {
      await axios.put(
        `https://localhost:7270/api/Trainers/${trainer.trainerId}`, 
        {
            trainerFullName: fullName.trim(),
            trainerPhoneNumber: phoneNumber.trim(),
            gender,
            sportComplexId: selectedComplexId
        },
        {headers: getAuthHeaders()})

      const updatedTrainer: TrainerFullScheduleDto = {
        ...trainer,
        trainerFullName: fullName,
        trainerPhoneNumber: phoneNumber,
        trainerGender: gender,
        trainerAddress: sportComplexes.find(sc => sc.sportComplexId === selectedComplexId)?.address || trainer.trainerAddress,
        trainerCity: sportComplexes.find(sc => sc.sportComplexId === selectedComplexId)?.city || trainer.trainerCity
      }

      toast.success('Тренера оновлено!')
      onSave(updatedTrainer)
      onClose()
    } catch {
      toast.error('Помилка при оновленні')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[500px] flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-primary">Редагування тренера</h2>

        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Повне ім'я"
          className="border rounded px-3 py-2 text-sm"
        />

        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Телефон"
          className="border rounded px-3 py-2 text-sm"
        />

        <select value={gender} onChange={(e) => setGender(e.target.value)} className="border px-3 py-2 rounded text-sm">
          <option value="Чоловік">Чоловік</option>
          <option value="Жінка">Жінка</option>
        </select>

        <select
          value={selectedComplexId ?? ''}
          onChange={(e) => setSelectedComplexId(Number(e.target.value))}
          className="border px-3 py-2 rounded text-sm"
        >
          <option value="">Оберіть спорткомплекс</option>
          {sportComplexes.map(sc => (
            <option key={sc.sportComplexId} value={sc.sportComplexId}>
              {sc.city}, {sc.address}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="text-gray-500 hover:underline">Скасувати</button>
          <button onClick={handleSave} className="bg-primary text-white px-4 py-2 rounded hover:opacity-90">Зберегти</button>
        </div>
      </div>
    </div>
  )
}
