import { useEffect, useState } from 'react'
import axios from 'axios'
import Header from '../../../layout/Header'
import TrainerCard from './TrainerCard'
import { TrainerFullScheduleDto } from '../InternalDtos'
import AddTrainer from './AddTrainer'
import { ExportModal } from '../../ExportModal'
import {exportData} from '../../../utils/exportData'

export default function TrainerList() {
  const [trainers, setTrainers] = useState<TrainerFullScheduleDto[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [selectedGender, setSelectedGender] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)

  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [availableAddresses, setAvailableAddresses] = useState<string[]>([])

  const [trigger, setTrigger] = useState(0)
  const [isAddingTrainer, setIsAddingTrainer] = useState(false)

  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  
  const handleAddTrainerSuccess = () => {
    fetchTrainers()
    setIsAddingTrainer(false)
  }

  const fetchTrainers = async () => {
    try {
      const res = await axios.get<TrainerFullScheduleDto[]>('https://localhost:7270/api/Trainers/full-schedules', {
        params: {
          gender: selectedGender || null,
          cities: selectedCity ? selectedCity : null,
          addresses: selectedAddress ? selectedAddress : null
        }
      })
      setTrainers(res.data)

      const uniqueCities = [...new Set(res.data.map(t => t.trainerCity))]
      setAvailableCities(uniqueCities)

      if (selectedCity) {
        const filteredAddresses = [...new Set(res.data.filter(t => t.trainerCity === selectedCity).map(t => t.trainerAddress))]
        setAvailableAddresses(filteredAddresses)
      } else {
        const allAddresses = [...new Set(res.data.map(t => t.trainerAddress))]
        setAvailableAddresses(allAddresses)
      }
    } catch (err) {
      console.error('Помилка завантаження тренерів:', err)
    }
  }

  useEffect(() => {
    fetchTrainers()
  }, [trigger])

  const handleExportFormat = (format: string) => {
    exportData(format, trainers)
    setIsExportModalOpen(false)
  }

  return (
    <div className={`flex flex-col gap-6 ${isFilterOpen ? 'w-[75%]' : 'w-[100%]'}`}>
      <Header
        title="Тренери"
        total={trainers.length}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddNew={() => setIsAddingTrainer(true)}
        onExportClick={() => setIsExportModalOpen(true)}>

        {/* Filters */}
        <div className="flex flex-col gap-4 text-sm text-gray-700">
          {/* Gender */}
          <div>
            <p className="font-semibold mb-1">Стать тренера:</p>
            <select
              value={selectedGender || ''}
              onChange={(e) => setSelectedGender(e.target.value || null)}
              className="border rounded px-2 py-1 w-full">
              <option value="">Всі</option>
              <option value="Чоловік">Чоловік</option>
              <option value="Жінка">Жінка</option>
            </select>
          </div>

          {/* City */}
          <div>
            <p className="font-semibold mb-1">Місто:</p>
            <select
              value={selectedCity || ''}
              onChange={(e) => {
                const val = e.target.value || null
                setSelectedCity(val)
                setSelectedAddress(null)
                if (val) {
                  const filteredAddresses = [...new Set(trainers.filter(t => t.trainerCity === val).map(t => t.trainerAddress))]
                  setAvailableAddresses(filteredAddresses)
                } else {
                  const allAddresses = [...new Set(trainers.map(t => t.trainerAddress))]
                  setAvailableAddresses(allAddresses)
                }
              }}
              className="border rounded px-2 py-1 w-full"
            >
              <option value="">Всі</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div>
            <p className="font-semibold mb-1">Адреса спорткомплексу:</p>
            <select
              value={selectedAddress || ''}
              onChange={(e) => setSelectedAddress(e.target.value || null)}
              className="border rounded px-2 py-1 w-full"
            >
              <option value="">Всі</option>
              {availableAddresses.map(address => (
                <option key={address} value={address}>{address}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setTrigger(prev => prev + 1)}
            className="mt-4 bg-primary text-white w-full py-2 rounded hover:opacity-90"
          >
            Застосувати фільтри
          </button>
        </div>
      </Header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {trainers
          .filter(t =>
            t.trainerFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.trainerPhoneNumber.includes(searchTerm) ||
            t.trainerGender.toLowerCase().includes(searchTerm) ||
            t.trainerAddress.toLowerCase().includes(searchTerm) ||
            t.trainerCity.toLowerCase().includes(searchTerm)
          )
          .map(trainer => (
            <TrainerCard 
              key={trainer.trainerId} 
              trainer={trainer} 
              search={searchTerm} 
              onDelete={(id) => setTrainers(prev => prev.filter(t => t.trainerId !== id))}
              onUpdate={(updatedTrainer) =>
                setTrainers(prev => prev.map(t => t.trainerId === updatedTrainer.trainerId ? updatedTrainer : t))
              }
              />
          ))}
      </div>

      {isAddingTrainer && (
        <AddTrainer
          onClose={() => setIsAddingTrainer(false)}
          onSuccess={() => {
            fetchTrainers()
            setIsAddingTrainer(false)
          }}
        />
      )}
      {isExportModalOpen && (
      <ExportModal
        onClose={() => setIsExportModalOpen(false)}
        onSelectFormat={(format) => {
          exportData(format, trainers)
          setIsExportModalOpen(false)
        }}
      />
    )}
    </div>
  )
}
