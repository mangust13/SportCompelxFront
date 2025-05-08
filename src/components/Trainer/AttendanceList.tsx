import { useEffect, useState } from 'react'
import axios from 'axios'
import { AttendanceRecordDto } from '../../constants/types'
import AttendanceCard from './AttendanceCard'
import Header from '../../layout/Header'
import { ITEMS_PER_PAGE, renderPagination } from '../../constants/pagination'
import { ExportModal } from '../ExportModal'
import {exportData} from '../../constants/exportData'

export default function AttendanceList() {
  const [allAttendances, setAllAttendances] = useState<AttendanceRecordDto[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [search, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('purchaseDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [activityFilters, setActivityFilters] = useState<string[]>([])
  const [availableActivities, setAvailableActivities] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [trigger, setTrigger] = useState(0)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const filteredAttendances = allAttendances.filter(a =>
    a.purchaseNumber.toString().includes(search) ||
    a.clientFullName.toLowerCase().includes(search.toLowerCase()) ||
    a.subscriptionName.toLowerCase().includes(search.toLowerCase()) ||
    a.subscriptionTerm.toLowerCase().includes(search.toLowerCase()) ||
    a.subscriptionVisitTime.toLowerCase().includes(search.toLowerCase()) ||
    a.subscriptionActivities.some(act =>
      act.activityName.toLowerCase().includes(search.toLowerCase())
    ) ||
    a.trainingStartTime.toLowerCase().includes(search.toLowerCase()) ||
    a.trainingEndTime.toLowerCase().includes(search.toLowerCase()) ||
    a.trainingActivity.toLowerCase().includes(search.toLowerCase()) ||
    new Date(a.attendanceDateTime).toLocaleString().toLowerCase().includes(search.toLowerCase())
  )

  const handleExportFormat = (format: string) => {
    exportData(format, filteredAttendances)
    setIsExportModalOpen(false)
  }

  useEffect(() => {
    axios.get('https://localhost:7270/api/Activities')
      .then(res => {
        const names = res.data.map((a: any) => a.activityName)
        setAvailableActivities(names)
      })
      .catch(err => console.error('Помилка завантаження активностей:', err))
  }, [])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const trainerId = user.trainerId

    axios.get('https://localhost:7270/api/attendanceRecord/attendances', {
      params: {
        trainerId,
        sortBy,
        order: sortOrder,
        activities: activityFilters.join(','),
        date: selectedDate || undefined
      }
    })
      .then(res => {
        setAllAttendances(res.data)
        setCurrentPage(1)
      })
      .catch(err => console.error('Помилка завантаження:', err))
  }, [trigger, sortBy, sortOrder, activityFilters, selectedDate])

  const totalPages = Math.ceil(filteredAttendances.length / ITEMS_PER_PAGE)

  const visibleAttendances = filteredAttendances.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className={`flex flex-col gap-6 ${isFilterOpen ? 'w-[75%]' : 'w-[100%]'}`}>
      <Header
        title="Всього відвідувань"
        total={allAttendances.length}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        searchTerm={search}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        sortOptions={[
          { value: 'purchaseNumber', label: 'Номер покупки' },
          { value: 'purchaseDate', label: 'Дата покупки' }
        ]}
        triggerSearch={() => setTrigger(prev => prev + 1)}
        onExportClick={() => setIsExportModalOpen(true)}
      >
        <div className="flex flex-col gap-4 text-sm text-gray-700">
          {/* Date filter */}
          <div>
            <p className="font-semibold mb-1">Дата відвідування:</p>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          {/* Activities */}
          <div>
            <p className="font-semibold mb-1">Види активностей:</p>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              {availableActivities.map(name => (
                <label key={name} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={activityFilters.includes(name)}
                    onChange={() =>
                      setActivityFilters(prev =>
                        prev.includes(name)
                          ? prev.filter(a => a !== name)
                          : [...prev, name]
                      )
                    }
                  />
                  {name}
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={() => setTrigger(prev => prev + 1)}
            className="mt-4 bg-primary text-white w-full py-2 rounded hover:opacity-90"
          >
            Застосувати фільтри
          </button>
        </div>
      </Header>

      <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 ${isFilterOpen ? 'xl:grid-cols-2' : 'xl:grid-cols-3'} items-start`}>
        {visibleAttendances.map(a => (
          <AttendanceCard
            key={a.attendanceId}
            attendance={a}
            search={search}
          />
        ))}
      </div>

      <div className="flex justify-center mt-6 gap-2 items-center flex-wrap">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={`w-8 h-8 rounded text-sm ${
            currentPage === 1 ? 'bg-gray-200 text-gray-400' : 'bg-white border hover:bg-gray-100 text-gray-700'
          }`}
        >
          &lt;
        </button>

        {renderPagination(currentPage, totalPages, setCurrentPage)}

        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className={`w-8 h-8 rounded text-sm ${
            currentPage === totalPages ? 'bg-gray-200 text-gray-400' : 'bg-white border hover:bg-gray-100 text-gray-700'
          }`}
        >
          &gt;
        </button>
      </div>

      {isExportModalOpen && (
        <ExportModal
          onClose={() => setIsExportModalOpen(false)}
          onSelectFormat={handleExportFormat}
        />
      )}
    </div>
  )
}
