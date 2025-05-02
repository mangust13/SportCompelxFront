import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

type TrainerDto = {
  trainerId: number
  trainerFullName: string
  trainerEmail: string
  trainerPhoneNumber: string
  trainerPhotoUrl?: string // якщо є фото, або можна заглушку
}

export default function TrainerList() {
  const [trainers, setTrainers] = useState<TrainerDto[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    axios.get('https://localhost:7270/api/Trainers')
      .then(res => setTrainers(res.data))
      .catch(err => console.error('Помилка завантаження тренерів:', err))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Ви точно хочете видалити цього тренера?')) return
    try {
      await axios.delete(`https://localhost:7270/api/Trainers/${id}`)
      setTrainers(prev => prev.filter(t => t.trainerId !== id))
      toast.success('Тренера видалено!')
    } catch (err) {
      toast.error('Помилка при видаленні тренера.')
    }
  }

  const filtered = trainers.filter(t =>
    t.trainerFullName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-primary">Тренери</h2>
        <input
          type="text"
          placeholder="Пошук..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map(trainer => (
          <div key={trainer.trainerId} className="bg-white shadow rounded p-4 flex flex-col items-center relative">
            <img
              src={trainer.trainerPhotoUrl || 'https://via.placeholder.com/100'}
              alt={trainer.trainerFullName}
              className="w-20 h-20 rounded-full object-cover mb-2"
            />
            <h3 className="font-bold">{trainer.trainerFullName}</h3>
            <p className="text-sm text-gray-600">📧 {trainer.trainerEmail}</p>
            <p className="text-sm text-gray-600">📞 {trainer.trainerPhoneNumber}</p>

            <div className="absolute top-2 right-2 flex gap-1">
              <button
                title="Редагувати"
                className="text-yellow-500 hover:text-yellow-600"
                onClick={() => toast.info('Редагування тренера')}
              >
                ✏️
              </button>
              <button
                title="Видалити"
                className="text-red-500 hover:text-red-600"
                onClick={() => handleDelete(trainer.trainerId)}
              >
                ❌
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
