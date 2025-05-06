import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

type ActivityDto = {
  activityId: number
  activityName: string
}

type SportComplexDto = {
  sportComplexId: number
  city: string
  address: string
}

type Props = {
  onClose: () => void
  onSuccess: () => void
}

export default function AddTrainer({ onClose, onSuccess }: Props) {
  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState('Чоловік')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [activities, setActivities] = useState<ActivityDto[]>([])
  const [selectedActivityIds, setSelectedActivityIds] = useState<number[]>([])

  const [sportComplexes, setSportComplexes] = useState<SportComplexDto[]>([])
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [availableAddresses, setAvailableAddresses] = useState<string[]>([])

  const [selectedCity, setSelectedCity] = useState('')
  const [selectedAddress, setSelectedAddress] = useState('')

  useEffect(() => {
    axios.get<ActivityDto[]>('https://localhost:7270/api/Activities')
      .then(res => setActivities(res.data))
      .catch(err => console.error('Помилка завантаження активностей:', err))

    axios.get<SportComplexDto[]>('https://localhost:7270/api/SportComplexes/all')
      .then(res => {
        setSportComplexes(res.data)
        const uniqueCities = [...new Set(res.data.map(sc => sc.city))]
        setAvailableCities(uniqueCities)
      })
      .catch(err => console.error('Помилка завантаження спорткомплексів:', err))
  }, [])

  useEffect(() => {
    if (selectedCity) {
      const filteredAddresses = sportComplexes
        .filter(sc => sc.city === selectedCity)
        .map(sc => sc.address)
      setAvailableAddresses(filteredAddresses)
    } else {
      setAvailableAddresses([])
      setSelectedAddress('')
    }
  }, [selectedCity, sportComplexes])

  const handleToggleActivity = (id: number) => {
    setSelectedActivityIds(prev =>
      prev.includes(id)
        ? prev.filter(aid => aid !== id)
        : [...prev, id]
    )
  }

  const handleSave = async () => {
    if (!fullName.trim() || !phoneNumber.trim() || !selectedCity || !selectedAddress) {
      toast.error('Будь ласка, заповніть всі поля.')
      return
    }

    const selectedComplex = sportComplexes.find(
      sc => sc.city === selectedCity && sc.address === selectedAddress
    )
    if (!selectedComplex) {
      toast.error('Обраний спорткомплекс не знайдено.')
      return
    }

    try {
      await axios.post('https://localhost:7270/api/Trainers', {
        trainerFullName: fullName.trim(),
        gender,
        trainerPhoneNumber: phoneNumber.trim(),
        sportComplexId: selectedComplex.sportComplexId,
        activityIds: selectedActivityIds
      })

      toast.success('Тренера успішно додано!')
      onSuccess()
    } catch (error) {
      toast.error('Помилка при додаванні тренера.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[500px] flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-primary">Новий тренер</h2>

        <input
          type="text"
          placeholder="Повне ім'я"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />

        <input
          type="text"
          placeholder="Номер телефону"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="Чоловік">Чоловік</option>
          <option value="Жінка">Жінка</option>
        </select>

        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">Оберіть місто</option>
          {availableCities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <select
          value={selectedAddress}
          onChange={(e) => setSelectedAddress(e.target.value)}
          className="border px-3 py-2 rounded"
          disabled={!selectedCity}
        >
          <option value="">Оберіть адресу</option>
          {availableAddresses.map(address => (
            <option key={address} value={address}>{address}</option>
          ))}
        </select>

        <div>
          <p className="font-semibold mb-1 text-sm">Активності (множинний вибір):</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activities.map(a => (
              <label key={a.activityId} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selectedActivityIds.includes(a.activityId)}
                  onChange={() => handleToggleActivity(a.activityId)}
                />
                {a.activityName}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="text-gray-500 hover:underline">
            Скасувати
          </button>
          <button
            onClick={handleSave}
            className="bg-primary text-white px-4 py-2 rounded hover:opacity-90"
          >
            Зберегти
          </button>
        </div>
      </div>
    </div>
  )
}
